const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const oldFetch = `  const fetchCompanyData = async () => {`;
const newFetch = `  const fetchCompanyData = async () => {
    if (!supabase) {
      // Mock Data for preview
      const mockComp: ObCompany = { id: 'mock', name: 'Mock BV', address: 'Straat 1', phone: '061234', billing_email: 'mock@mock.nl', billing_info: 'KVK: 12345678', allowed_email_domain: '@mock.nl', is_approved: true, created_at: new Date().toISOString() };
      setCompany(mockComp);
      setBillingEmail(mockComp.billing_email || '');
      setBillingInfo(mockComp.billing_info || '');
      setAllowedDomain(mockComp.allowed_email_domain || '');
      setAddresses([{ id: 'a1', label: 'Hoofdkantoor', address_line: 'Straat 1, Ams', instructions: 'Bellen bij receptie' }]);
      setSelectedProducts(['Bitterballen Deal', 'Bitterballen']);
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get profile to find company_id or admin role
      const { data: profile } = await supabase.from('ob_user_profiles').select('*').eq('id', session.user.id).single();
      
      const targetCompanyId = (profile?.role === 'admin' && impersonateId) ? impersonateId : profile?.company_id;

      if (!targetCompanyId) {
        navigate('/'); // Not an office manager and no company ID to impersonate
        return;
      }

      const { data: comp } = await supabase.from('ob_companies').select('*').eq('id', targetCompanyId).single();
      if (comp) {
        setCompany(comp);
        setBillingEmail(comp.billing_email || '');
        setBillingInfo(comp.billing_info || '');
        setAllowedDomain(comp.allowed_email_domain || '');
        
        // Fetch addresses
        const { data: addrData } = await supabase.from('ob_company_addresses').select('*').eq('company_id', comp.id);
        if (addrData) setAddresses(addrData);

        // Fetch assortment
        const { data: assortData } = await supabase.from('ob_company_assortment').select('product_name').eq('company_id', comp.id);
        if (assortData) setSelectedProducts(assortData.map((a: any) => a.product_name));
      }
    } catch (e) {
      console.error(e);
      setError('Fout bij het laden van gegevens.');
    } finally {
      setIsLoading(false);
    }
  };`;

// replace from `const fetchCompanyData = async () => {` until `const showSuccess = () => {`
const startIdx = code.indexOf(oldFetch);
const endIdx = code.indexOf(`  const showSuccess = () => {`);
if(startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newFetch + "\n\n" + code.substring(endIdx);
  fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
}
