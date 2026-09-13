const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const newSave = `  const handleSaveDeliveryMethods = async () => {
    if (!company) return;
    setIsSaving(true);
    if (supabase) {
      const { error: delError } = await supabase.from('ob_company_delivery_methods').delete().eq('company_id', company.id);
      if (delError) {
        alert('Fout bij opslaan: ' + delError.message);
        setIsSaving(false);
        return;
      }
      if (selectedDeliveryMethods.length > 0) {
        const inserts = selectedDeliveryMethods.map(id => ({ company_id: company.id, delivery_method_id: id }));
        const { error: insError } = await supabase.from('ob_company_delivery_methods').insert(inserts);
        if (insError) {
          alert('Fout bij opslaan: ' + insError.message);
          setIsSaving(false);
          return;
        }
      }
      showSuccess();
    }
    setIsSaving(false);
  };`;

code = code.replace(/const handleSaveDeliveryMethods = async \(\) => \{[\s\S]*?setIsSaving\(false\);\n  \};/, newSave);
fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
