import React, { useState, useEffect } from 'react';
import { X, Printer, Check, Copy, Building2, Calendar, CreditCard, ShieldCheck, Mail, Send, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export interface MonthlyInvoiceData {
  company: any;
  month: number; // 1-12
  year: number;  // e.g. 2026
  monthName: string; // e.g. "September 2026"
  orders: any[]; // completed grouped orders for that month
  customInvoiceNumber?: string;
}

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderGroup?: any | null; // For single order
  monthlyData?: MonthlyInvoiceData | null; // For collective monthly invoice
  customerCompany?: any | null;
  storeSettings?: any | null;
  initialShowEmail?: boolean;
}

export function InvoiceModal({
  isOpen,
  onClose,
  orderGroup,
  monthlyData,
  customerCompany,
  storeSettings,
  initialShowEmail = false,
}: InvoiceModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!orderGroup && !monthlyData)) return null;

  const isMonthly = Boolean(monthlyData && monthlyData.orders && monthlyData.orders.length > 0);

  // Company settings (with Office Butler & Mokum Local Kitchen defaults)
  const pageContent = storeSettings?.page_content || {};
  const brandName = pageContent.invoice_brand_name || 'Office Butler';
  const logoUrl = pageContent.invoice_logo_url || 'https://i.imgur.com/ymXR7tL.png';
  const sellerName = pageContent.invoice_company_name || 'Mokum Local Kitchen';
  const sellerKvk = pageContent.invoice_kvk || '99852667';
  const sellerVat = pageContent.invoice_vat_number || 'NL868877037B01';
  const sellerIban = pageContent.invoice_iban || 'NL16ABNA0153600063';
  const sellerBic = pageContent.invoice_bic || 'ABNANL2A';
  const sellerEmail = pageContent.invoice_email || 'info@office-butler.com';
  const sellerAddress = pageContent.invoice_address || 'Muiderstraat 18-s, 1011 RB Amsterdam';
  const paymentTermsDays = Number(pageContent.invoice_payment_terms_days) || 14;

  // Recipient / Client details
  let clientName = '';
  let clientPhone = '';
  let clientEmail = '';
  let clientBillingInfo = '';
  let deliveryAddress = '';

  if (isMonthly) {
    const comp = monthlyData!.company;
    clientName = comp?.name || 'Zakelijke Klant';
    clientPhone = comp?.phone || monthlyData!.orders[0]?.phone || '';
    clientEmail = comp?.billing_email || comp?.email || comp?.contact_email || monthlyData!.orders[0]?.customer_email || monthlyData!.orders[0]?.email || '';
    clientBillingInfo = comp?.billing_info || '';
    deliveryAddress = comp?.address || monthlyData!.orders[0]?.address || 'Locatie Amsterdam';
  } else {
    const isGuest = !orderGroup.company_id;
    clientName = customerCompany?.name || orderGroup.company_name || (isGuest ? 'Particuliere Gast' : 'Zakelijke Klant');
    clientPhone = orderGroup.phone || customerCompany?.phone || '';
    clientEmail = customerCompany?.billing_email || customerCompany?.email || customerCompany?.contact_email || orderGroup.customer_email || orderGroup.email || orderGroup.items?.[0]?.customer_email || '';
    clientBillingInfo = customerCompany?.billing_info || '';
    deliveryAddress = orderGroup.address || customerCompany?.address || 'Locatie Amsterdam';
  }

  // Invoice Number Generation
  let invoiceNumber = '';
  let orderDate = new Date();

  if (isMonthly) {
    const monthAbbr = (monthlyData!.monthName || '').slice(0, 3).toUpperCase();
    const compCode = String(clientName || 'BEDRIJF')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase();
    invoiceNumber = monthlyData!.customInvoiceNumber || `MLK-${monthlyData!.year}-${monthAbbr}-${compCode || '01'}`;
    
    // Default invoice date: last day of that month or today
    const lastDayOfMonth = new Date(monthlyData!.year, monthlyData!.month, 0);
    orderDate = lastDayOfMonth > new Date() ? new Date() : lastDayOfMonth;
  } else {
    orderDate = new Date(orderGroup.created_at || Date.now());
    const year = orderDate.getFullYear();
    const hashSeed = Math.abs(
      String(orderGroup.id || '')
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 1000)
    ) % 9000 + 1000;
    invoiceNumber = `MLK-${year}-${hashSeed}`;
  }

  // Dates
  const invoiceDateStr = orderDate.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const dueDate = new Date(orderDate.getTime() + paymentTermsDays * 24 * 60 * 60 * 1000);
  const dueDateStr = dueDate.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Calculate items and totals
  let singleAggregatedItems: any[] = [];
  let singleDiscountAmount = 0;
  let singleDiscountInfo: any = null;

  let monthlyRows: any[] = [];
  let netPayableInclVat = 0;

  if (isMonthly) {
    // Process monthly orders (each order is a row)
    monthlyRows = (monthlyData!.orders || []).map((ord: any) => {
      const ordDiscount = ord.discount && Number(ord.discount.amount) > 0 ? Number(ord.discount.amount) : 0;
      const ordGross = Number(ord.total_order_price || 0);
      const ordNet = Math.max(0, ordGross - ordDiscount);
      const ordExclVat = ordNet / 1.09;

      // Summary of products
      const summary = (ord.items || [])
        .map((i: any) => `${i.product_name} (${i.portion_size} st)`)
        .join(', ');

      const totalItemsCount = (ord.items || []).reduce((acc: number, i: any) => acc + (Number(i.quantity) || 1), 0);

      const dFormatted = ord.delivery_date
        ? new Date(ord.delivery_date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date(ord.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });

      return {
        id: ord.id,
        dateFormatted: dFormatted,
        time: ord.delivery_time || '16:00',
        summary: summary || 'Borrelarrangement & Snacks',
        location: ord.address || '',
        itemsCount: totalItemsCount,
        gross: ordGross,
        discount: ordDiscount,
        discountCode: ord.discount?.code,
        netPayable: ordNet,
        exclVat: ordExclVat,
      };
    });

    netPayableInclVat = monthlyRows.reduce((sum, r) => sum + r.netPayable, 0);
  } else {
    // Single order calculation
    const rawItems = orderGroup.items || [];
    const itemMap = new Map<string, { name: string; portionSize: number; qty: number; unitPriceIncl: number; totalIncl: number }>();

    rawItems.forEach((item: any) => {
      const key = `${item.product_name}_${item.portion_size}`;
      const unitPrice = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = Number(item.total_price || unitPrice * qty);

      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;
        existing.qty += qty;
        existing.totalIncl += lineTotal;
      } else {
        itemMap.set(key, {
          name: item.product_name,
          portionSize: item.portion_size,
          qty: qty,
          unitPriceIncl: unitPrice,
          totalIncl: lineTotal,
        });
      }
    });

    singleAggregatedItems = Array.from(itemMap.values());
    singleDiscountInfo = orderGroup.discount;
    singleDiscountAmount = singleDiscountInfo && Number(singleDiscountInfo.amount) > 0 ? Number(singleDiscountInfo.amount) : 0;

    const grossTotal = singleAggregatedItems.reduce((acc, item) => acc + item.totalIncl, 0);
    netPayableInclVat = Math.max(0, grossTotal - singleDiscountAmount);
  }

  // VAT calculations (Standard 9% for Dutch catering / food)
  const vatRate = 0.09;
  const subtotalExclVat = netPayableInclVat / (1 + vatRate);
  const vatAmount = netPayableInclVat - subtotalExclVat;

  // Email dispatch state
  const [isEmailPanelOpen, setIsEmailPanelOpen] = useState(Boolean(initialShowEmail));
  const [recipientEmailInput, setRecipientEmailInput] = useState(clientEmail);
  const [subjectInput, setSubjectInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (clientEmail && !recipientEmailInput) {
      setRecipientEmailInput(clientEmail);
    }
  }, [clientEmail]);

  useEffect(() => {
    if (initialShowEmail) {
      setIsEmailPanelOpen(true);
    }
  }, [initialShowEmail]);

  const defaultSubject = isMonthly
    ? (pageContent.email_monthly_invoice_subject 
        ? String(pageContent.email_monthly_invoice_subject)
            .replace(/\{factuurnummer\}/g, invoiceNumber)
            .replace(/\{klantnaam\}/g, clientName)
            .replace(/\{bedrijfsnaam\}/g, sellerName)
            .replace(/\{maand\}/g, monthlyData!.monthName)
            .replace(/\{betaaltermijn\}/g, String(paymentTermsDays))
        : `Verzamelfactuur ${monthlyData!.monthName} - ${invoiceNumber} - ${clientName}`)
    : (pageContent.email_invoice_subject
        ? String(pageContent.email_invoice_subject)
            .replace(/\{factuurnummer\}/g, invoiceNumber)
            .replace(/\{klantnaam\}/g, clientName)
            .replace(/\{bedrijfsnaam\}/g, sellerName)
            .replace(/\{betaaltermijn\}/g, String(paymentTermsDays))
        : `Factuur ${invoiceNumber} - ${clientName} (${sellerName})`);

  const handleSendEmail = async () => {
    const targetEmail = recipientEmailInput.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setSendErrorMessage('Vul een geldig e-mailadres in.');
      return;
    }

    setIsSendingEmail(true);
    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    try {
      const payload = {
        recipientEmail: targetEmail,
        invoiceType: isMonthly ? 'monthly' : 'single',
        invoiceNumber,
        invoiceDate: invoiceDateStr,
        dueDate: dueDateStr,
        monthName: isMonthly ? monthlyData?.monthName : undefined,
        sellerDetails: {
          name: sellerName,
          brandName: brandName,
          logoUrl: logoUrl,
          kvk: sellerKvk,
          vat: sellerVat,
          iban: sellerIban,
          bic: sellerBic,
          email: sellerEmail,
          address: sellerAddress,
          paymentTermsDays,
        },
        clientDetails: {
          name: clientName,
          phone: clientPhone,
          email: targetEmail,
          billingInfo: clientBillingInfo,
          address: deliveryAddress,
        },
        items: isMonthly ? monthlyRows : singleAggregatedItems,
        subtotalExcl: subtotalExclVat,
        vatAmount,
        totalAmount: netPayableInclVat,
        discountAmount: isMonthly ? 0 : singleDiscountAmount,
        discountCode: isMonthly ? '' : singleDiscountInfo?.code,
        customSubject: subjectInput.trim() || defaultSubject,
        customIntro: isMonthly ? pageContent.email_monthly_intro : pageContent.email_invoice_intro,
        customOutro: isMonthly ? pageContent.email_monthly_outro : pageContent.email_invoice_outro,
      };

      const res = await fetch('/api/send-invoice-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || resData.error || resData.success === false) {
        throw new Error(resData.error || resData.message || 'Verzenden mislukt');
      }

      setSendSuccessMessage(`Factuur ${invoiceNumber} is met één klik succesvol gemaild naar ${targetEmail}!`);
    } catch (err: any) {
      console.error('Error sending invoice email:', err);
      setSendErrorMessage(err.message || 'Er is een fout opgetreden bij het verzenden van de factuur.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `${isMonthly ? 'VERZAMELFACTUUR' : 'FACTUUR'}: ${invoiceNumber}
Bedrijf: ${sellerName} (KVK: ${sellerKvk}, IBAN: ${sellerIban})
Klant: ${clientName}
${isMonthly ? `Periode: ${monthlyData!.monthName} (${monthlyData!.orders.length} leveringen)` : `Levering: ${orderGroup.delivery_date || 'In overleg'}`}
Factuurdatum: ${invoiceDateStr}
Vervaldatum: ${dueDateStr} (14 dagen)
Totaalbedrag: €${netPayableInclVat.toFixed(2)} (incl. 9% BTW)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Print Stylesheet strictly scoping printed page to #mokum-invoice-sheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body * {
            visibility: hidden !important;
          }
          #mokum-invoice-sheet, #mokum-invoice-sheet * {
            visibility: visible !important;
          }
          #mokum-invoice-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main modal container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#05053D] text-white border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#b58b4c]" />
            <span className="font-semibold text-base sm:text-lg">
              {isMonthly ? 'Maand- / Verzamelfactuur Preview' : 'Factuur Preview & Download'}
            </span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/80 font-mono">
              {invoiceNumber}
            </span>
            {isMonthly && (
              <span className="text-xs bg-[#b58b4c] text-white px-2 py-0.5 rounded font-semibold">
                {monthlyData!.monthName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEmailPanelOpen(!isEmailPanelOpen);
                setSendSuccessMessage(null);
                setSendErrorMessage(null);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 shadow-sm transition-all ${
                isEmailPanelOpen 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Factuur met één klik rechtstreeks mailen naar klant via Resend"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Factuur Mailen</span>
              {isEmailPanelOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
              title="Kopieer samenvatting naar klembord"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Gekopieerd!' : 'Kopiëren'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs px-4 py-1.5 rounded-lg bg-[#b58b4c] hover:bg-[#a3793b] text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              title="Afdrukken of opslaan als PDF via printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Afdrukken / Opslaan als PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Direct Email Panel (Resend) */}
        {isEmailPanelOpen && (
          <div className="no-print bg-slate-900 border-b border-slate-800 px-6 py-4 text-white text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-sm">Factuur direct mailen naar klant via Resend</span>
              </div>
              {sendSuccessMessage && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-medium text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {sendSuccessMessage}
                </span>
              )}
              {sendErrorMessage && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/90 border border-red-500/50 text-red-300 font-medium text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" /> {sendErrorMessage}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  E-mailadres klant (Ontvanger)
                </label>
                <input
                  type="email"
                  value={recipientEmailInput}
                  onChange={(e) => setRecipientEmailInput(e.target.value)}
                  placeholder="bijv. finance@bedrijf.nl"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Onderwerp e-mail
                </label>
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder={defaultSubject}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !recipientEmailInput.trim()}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  title="Klik om de factuur direct per e-mail te versturen"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verzenden...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Verstuur via Resend</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
              <span>
                De klant ontvangt de factuurspecificatie in Mokum Local Kitchen opmaak. Er wordt automatisch een CC gestuurd naar <strong className="text-slate-300">{sellerEmail}</strong>.
              </span>
              {clientEmail && (
                <span className="text-slate-400">
                  Geregistreerd klantadres: <strong className="text-slate-200">{clientEmail}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scrollable invoice document area */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-gray-100 flex justify-center">
          {/* Printable A4 Paper Invoice Sheet */}
          <div
            id="mokum-invoice-sheet"
            className="w-full max-w-[800px] bg-white text-gray-900 p-8 sm:p-12 rounded-xl shadow-lg border border-gray-200"
            style={{ minHeight: '1050px', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            {/* Header: Logo & Sender Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-6 mb-8 gap-6">
              {/* Prominent Office Butler Logo in a stylish contour box */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-sm bg-[#151f33] shrink-0 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt={brandName}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#05053D] tracking-tight">{brandName}</h1>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Catering &amp; Borrelservice &bull; Keuken {sellerName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{sellerAddress}</p>
                </div>
              </div>

              {/* Sender Tax & Legal Info (Mokum Local Kitchen) */}
              <div className="text-left sm:text-right text-xs text-gray-600 space-y-0.5">
                <div className="font-bold text-gray-900 text-sm mb-1">{sellerName}</div>
                <div>{sellerAddress}</div>
                <div><span className="font-semibold text-gray-800">KVK:</span> {sellerKvk}</div>
                <div><span className="font-semibold text-gray-800">BTW:</span> {sellerVat}</div>
                <div><span className="font-semibold text-gray-800">IBAN:</span> <span className="font-mono font-medium text-gray-900">{sellerIban}</span></div>
                {sellerBic && <div><span className="font-semibold text-gray-800">BIC:</span> {sellerBic}</div>}
              </div>
            </div>

            {/* Document Title & Invoice Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Recipient / Customer Info */}
              <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-200">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Factuur aan:</div>
                <div className="text-lg font-bold text-[#05053D]">{clientName}</div>
                {clientEmail && <div className="text-xs text-gray-600 mt-0.5">{clientEmail}</div>}
                {clientPhone && <div className="text-xs text-gray-600 mt-0.5">Tel: {clientPhone}</div>}
                
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-700">
                  <div className="font-semibold text-gray-800 mb-0.5">Afleveradres / Vestiging:</div>
                  <div>{deliveryAddress}</div>
                </div>

                {clientBillingInfo && (
                  <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-700">Factuurreferentie / KVK:</span> {clientBillingInfo}
                  </div>
                )}
              </div>

              {/* Invoice Numbers & Deadlines */}
              <div className="bg-[#05053D]/5 p-5 rounded-xl border border-[#05053D]/10 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#05053D] uppercase tracking-wider mb-1">
                    {isMonthly ? 'Officiële Verzamelfactuur' : 'Officiële Factuur'}
                  </div>
                  <div className="text-2xl font-extrabold text-[#05053D] tracking-tight">{invoiceNumber}</div>
                  {isMonthly && (
                    <div className="text-xs font-semibold text-[#b58b4c] mt-0.5">
                      Borrellevingen over {monthlyData!.monthName}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs mt-4">
                  <span className="text-gray-500">Factuurdatum:</span>
                  <span className="font-semibold text-gray-900 text-right">{invoiceDateStr}</span>

                  <span className="text-gray-500">Vervaldatum:</span>
                  <span className="font-semibold text-gray-900 text-right">{dueDateStr}</span>

                  <span className="text-gray-500">Betaaltermijn:</span>
                  <span className="font-semibold text-emerald-700 text-right">{paymentTermsDays} dagen</span>

                  <span className="text-gray-500">{isMonthly ? 'Aantal leveringen:' : 'Bezorgmoment:'}</span>
                  <span className="font-semibold text-gray-900 text-right">
                    {isMonthly ? `${monthlyData!.orders.length} afgeronde orders` : `${orderGroup.delivery_date ? new Date(orderGroup.delivery_date).toLocaleDateString('nl-NL') : 'In overleg'} (${orderGroup.delivery_time || 'Z.s.m.'})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Instruction banner before table (as in example PDF) */}
            <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
              Betaling graag binnen {paymentTermsDays} dagen via bankoverschrijving op IBAN: <strong className="font-mono text-gray-900">{sellerIban}</strong> onder vermelding van factuurnummer <strong className="font-mono text-gray-900">{invoiceNumber}</strong>.
            </div>

            {/* Itemized Table (Conditional for Single vs Monthly) */}
            <div className="mb-8">
              {isMonthly ? (
                /* MONTHLY COLLECTIVE INVOICE TABLE (List of completed orders in that month) */
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700 text-xs font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg whitespace-nowrap">Datum</th>
                      <th className="py-2.5 px-3">Specificatie / Bestelde Producten</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Items</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Bedrag Excl. BTW</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Bedrag Inc. BTW</th>
                      <th className="py-2.5 px-3 text-center rounded-r-lg whitespace-nowrap">BTW</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {monthlyRows.map((row, idx) => (
                      <tr key={`monthly-row-${row.id || idx}-${idx}`} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 font-semibold text-gray-900 whitespace-nowrap align-top">
                          {row.dateFormatted}
                          <div className="text-[11px] font-normal text-gray-500">om {row.time}</div>
                        </td>
                        <td className="py-3 px-3 text-gray-800 align-top">
                          <div className="font-medium text-[#05053D]">{row.summary}</div>
                          {row.location && (
                            <div className="text-[11px] text-gray-500 mt-0.5">Locatie: {row.location}</div>
                          )}
                          {row.discount > 0 && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 rounded">
                              Korting {row.discountCode ? `(${row.discountCode})` : ''} -€{row.discount.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-600 align-top whitespace-nowrap">
                          {row.itemsCount} stuks
                        </td>
                        <td className="py-3 px-3 text-right text-gray-600 align-top whitespace-nowrap">
                          €{row.exclVat.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900 align-top whitespace-nowrap">
                          €{row.netPayable.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-600 font-medium align-top whitespace-nowrap">
                          9,0%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* SINGLE ORDER INVOICE TABLE */
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700 text-xs font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg whitespace-nowrap">Aantal</th>
                      <th className="py-2.5 px-3">Omschrijving</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Bedrag Excl. BTW</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Bedrag Inc. BTW</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Totaal Excl. BTW</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Totaal Inc. BTW</th>
                      <th className="py-2.5 px-3 text-center rounded-r-lg whitespace-nowrap">BTW</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {singleAggregatedItems.map((item, idx) => {
                      const unitPriceIncl = Number(item.unitPriceIncl || 0);
                      const unitPriceExcl = unitPriceIncl / 1.09;
                      const lineTotalIncl = Number(item.totalIncl || unitPriceIncl * item.qty);
                      const lineTotalExcl = lineTotalIncl / 1.09;

                      return (
                        <tr key={`invoice-item-${item.name}-${item.portionSize}-${idx}`} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-semibold text-gray-900 whitespace-nowrap align-top">
                            {item.qty} x
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-900 align-top">
                            <div>{item.name}</div>
                            {item.portionSize ? (
                              <span className="text-gray-500 text-[11px] block mt-0.5">
                                ({item.portionSize} stuks)
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-600 align-top whitespace-nowrap">
                            €{unitPriceExcl.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-600 align-top whitespace-nowrap">
                            €{unitPriceIncl.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-600 align-top whitespace-nowrap">
                            €{lineTotalExcl.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-gray-900 align-top whitespace-nowrap">
                            €{lineTotalIncl.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center text-gray-600 font-medium align-top whitespace-nowrap">
                            9,0%
                          </td>
                        </tr>
                      );
                    })}

                    {/* Discount row if applicable */}
                    {singleDiscountAmount > 0 && (() => {
                      const discIncl = singleDiscountAmount;
                      const discExcl = discIncl / 1.09;
                      return (
                        <tr className="bg-emerald-50/60 text-emerald-800 font-medium">
                          <td className="py-2.5 px-3 whitespace-nowrap">1 x</td>
                          <td className="py-2.5 px-3">
                            Kortingscode: <strong>{singleDiscountInfo?.code || 'KORTING'}</strong>
                            {singleDiscountInfo?.label && <span className="text-[11px] text-emerald-700 block">({singleDiscountInfo.label})</span>}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">-€{discExcl.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">-€{discIncl.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">-€{discExcl.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">-€{discIncl.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">9,0%</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              )}
            </div>

            {/* Totals & VAT Breakdown Section */}
            <div className="flex justify-end mb-10">
              <div className="w-full sm:w-72 bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Subtotaal (excl. BTW):</span>
                  <span className="font-semibold text-gray-900">€{subtotalExclVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">9,00% BTW:</span>
                  <span className="font-semibold text-gray-900">€{vatAmount.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-900 pt-2 flex justify-between text-sm font-extrabold text-[#05053D]">
                  <span>Totaal (incl. BTW):</span>
                  <span className="text-base text-gray-900">€{netPayableInclVat.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment & Bank Instructions Box */}
            <div className="bg-[#05053D]/5 border-l-4 border-[#05053D] p-5 rounded-r-xl mb-12">
              <h3 className="text-xs font-bold uppercase text-[#05053D] tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#b58b4c]" />
                Betalingsinstructies (Betaaltermijn {paymentTermsDays} dagen)
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                Gelieve het totaalbedrag van <strong className="text-gray-900 font-bold">€{netPayableInclVat.toFixed(2)}</strong> {isMonthly ? `voor de leveringen van ${monthlyData!.monthName} ` : ''}uiterlijk vóór <strong className="text-gray-900">{dueDateStr}</strong> over te maken naar:
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[11px]">Ten name van:</span>
                  <span className="font-semibold text-gray-900">{sellerName} ({brandName})</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">IBAN Rekeningnummer:</span>
                  <span className="font-mono font-bold text-gray-900">{sellerIban}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">BIC / SWIFT:</span>
                  <span className="font-mono text-gray-900">{sellerBic}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Betalingskenmerk / Referentie:</span>
                  <span className="font-mono font-bold text-[#05053D]">{invoiceNumber}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center border-t border-gray-200 pt-6 text-[11px] text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Bedankt voor uw klandizie en bestelling bij {brandName}!</p>
              <p>Voor vragen over deze factuur kunt u contact opnemen via {sellerEmail}.</p>
              <p className="text-[10px] text-gray-400 mt-2">
                {brandName} &bull; Catering verzorgd door {sellerName} &bull; KVK {sellerKvk} &bull; BTW {sellerVat} &bull; {sellerAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
