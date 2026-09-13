const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const newSave = `  const handleSaveAssortment = async () => {
    if (!company) return;
    setIsSaving(true);

    if (supabase) {
      // Clear old assortment
      const { error: delError } = await supabase.from('ob_company_assortment').delete().eq('company_id', company.id);
      if (delError) {
        alert('Fout bij opslaan (rechten probleem?): ' + delError.message);
        setIsSaving(false);
        return;
      }
      
      // Insert new assortment
      if (selectedProducts.length > 0) {
        const inserts = selectedProducts.map(p => ({ company_id: company.id, product_name: p }));
        const { error: insError } = await supabase.from('ob_company_assortment').insert(inserts);
        if (insError) {
          alert('Fout bij opslaan (rechten probleem?): ' + insError.message);
          setIsSaving(false);
          return;
        }
      }
      showSuccess();
    } else {
      showSuccess(); // Mock
    }
    setIsSaving(false);
  };`;

code = code.replace(/const handleSaveAssortment = async \(\) => \{[\s\S]*?setIsSaving\(false\);\n  \};/, newSave);
fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
