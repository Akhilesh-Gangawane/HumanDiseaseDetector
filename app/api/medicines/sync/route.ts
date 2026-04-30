import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * POST /api/medicines/sync
 * Syncs medicine data from FDA API and adds common medicines
 * No authentication required
 */
export async function POST() {
  try {
    console.log('Starting medicine sync...');
    
    // Common medicine names to fetch from FDA
    const commonMedicines = [
      'aspirin', 'ibuprofen', 'acetaminophen', 'amoxicillin', 'azithromycin',
      'metformin', 'atorvastatin', 'lisinopril', 'omeprazole', 'losartan',
      'amlodipine', 'metoprolol', 'simvastatin', 'levothyroxine', 'albuterol',
      'gabapentin', 'hydrochlorothiazide', 'sertraline', 'montelukast', 'furosemide',
      'pantoprazole', 'cetirizine', 'loratadine', 'prednisone', 'tramadol'
    ];

    const allMedicines: any[] = [];
    let successCount = 0;
    let failCount = 0;

    // Fetch from FDA API
    for (const medicineName of commonMedicines) {
      try {
        console.log(`Fetching ${medicineName} from FDA...`);
        const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${medicineName}"OR openfda.generic_name:"${medicineName}"&limit=1`;
        
        const response = await fetch(fdaUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const drug = data.results[0];
            const brandName = drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || medicineName;
            const genericName = drug.openfda?.generic_name?.[0] || '';
            const manufacturer = drug.openfda?.manufacturer_name?.[0] || 'Generic Pharma';
            const productType = drug.openfda?.product_type?.[0] || '';
            
            // Extract description
            let description = '';
            if (drug.indications_and_usage && drug.indications_and_usage[0]) {
              description = drug.indications_and_usage[0].substring(0, 150).trim() + '...';
            } else if (drug.purpose && drug.purpose[0]) {
              description = drug.purpose[0].substring(0, 150).trim() + '...';
            } else {
              description = `${brandName} - ${genericName || 'Pharmaceutical product'}`;
            }

            const medicine = {
              name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
              category: getCategoryFromProductType(productType, genericName),
              price: generatePrice(getCategoryFromProductType(productType, genericName)),
              original_price: null,
              manufacturer: manufacturer,
              description: description.replace(/\n/g, ' ').replace(/\s+/g, ' '),
              rating: 4.5,
              reviews_count: Math.floor(Math.random() * 1000) + 100,
              in_stock: true,
              requires_prescription: productType.toLowerCase().includes('prescription'),
            };

            allMedicines.push(medicine);
            successCount++;
            console.log(`✓ Added ${brandName}`);
          }
        }
        
        // Rate limiting - wait 250ms between requests
        await new Promise(resolve => setTimeout(resolve, 250));
        
      } catch (error) {
        console.error(`Failed to fetch ${medicineName}:`, error);
        failCount++;
      }
    }

    // Add some common Indian medicines not in FDA
    const indianMedicines = [
      { name: 'Paracetamol 500mg', category: 'Pain Relief', price: 15.00, manufacturer: 'Generic Pharma', description: 'Effective pain and fever relief medication', rating: 4.5, reviews_count: 1250, in_stock: true, requires_prescription: false },
      { name: 'Paracetamol 650mg', category: 'Pain Relief', price: 20.00, manufacturer: 'Generic Pharma', description: 'Higher strength pain and fever relief', rating: 4.6, reviews_count: 980, in_stock: true, requires_prescription: false },
      { name: 'Diclofenac 50mg', category: 'Pain Relief', price: 40.00, manufacturer: 'Generic Pharma', description: 'Strong anti-inflammatory medication', rating: 4.3, reviews_count: 620, in_stock: true, requires_prescription: true },
      { name: 'Ciprofloxacin 500mg', category: 'Antibiotic', price: 95.00, manufacturer: 'Generic Pharma', description: 'Treats bacterial infections', rating: 4.4, reviews_count: 680, in_stock: true, requires_prescription: true },
      { name: 'Doxycycline 100mg', category: 'Antibiotic', price: 110.00, manufacturer: 'Generic Pharma', description: 'Treats various bacterial infections', rating: 4.5, reviews_count: 540, in_stock: true, requires_prescription: true },
      { name: 'Glimepiride 1mg', category: 'Diabetes', price: 95.00, manufacturer: 'Generic Pharma', description: 'Controls blood sugar levels', rating: 4.5, reviews_count: 780, in_stock: true, requires_prescription: true },
      { name: 'Insulin Glargine 100IU', category: 'Diabetes', price: 850.00, manufacturer: 'Novo Nordisk', description: 'Long-acting insulin for diabetes', rating: 4.8, reviews_count: 650, in_stock: true, requires_prescription: true },
      { name: 'Atenolol 50mg', category: 'Blood Pressure', price: 65.00, manufacturer: 'Generic Pharma', description: 'Beta-blocker for blood pressure control', rating: 4.4, reviews_count: 870, in_stock: true, requires_prescription: true },
      { name: 'Telmisartan 40mg', category: 'Blood Pressure', price: 110.00, manufacturer: 'Generic Pharma', description: 'Effective hypertension control', rating: 4.6, reviews_count: 720, in_stock: true, requires_prescription: true },
      { name: 'Rosuvastatin 10mg', category: 'Cholesterol', price: 180.00, manufacturer: 'Generic Pharma', description: 'Powerful cholesterol reducer', rating: 4.7, reviews_count: 760, in_stock: true, requires_prescription: true },
      { name: 'Ranitidine 150mg', category: 'Gastric', price: 35.00, manufacturer: 'Generic Pharma', description: 'H2 blocker for acidity relief', rating: 4.4, reviews_count: 980, in_stock: true, requires_prescription: false },
      { name: 'Domperidone 10mg', category: 'Gastric', price: 40.00, manufacturer: 'Generic Pharma', description: 'Anti-nausea and bloating relief', rating: 4.3, reviews_count: 720, in_stock: true, requires_prescription: false },
      { name: 'Montelukast 10mg', category: 'Allergy', price: 85.00, manufacturer: 'Generic Pharma', description: 'Asthma and allergy prevention', rating: 4.7, reviews_count: 890, in_stock: true, requires_prescription: true },
      { name: 'Vitamin D3 60000 IU', category: 'Vitamins', price: 120.00, manufacturer: 'Generic Pharma', description: 'Bone health supplement', rating: 4.7, reviews_count: 2100, in_stock: true, requires_prescription: false },
      { name: 'Vitamin B12 1500mcg', category: 'Vitamins', price: 95.00, manufacturer: 'Generic Pharma', description: 'Energy and nerve health', rating: 4.6, reviews_count: 1450, in_stock: true, requires_prescription: false },
      { name: 'Omega-3 Fish Oil', category: 'Vitamins', price: 350.00, manufacturer: 'Generic Pharma', description: 'Heart and brain health supplement', rating: 4.7, reviews_count: 1560, in_stock: true, requires_prescription: false },
      { name: 'Salbutamol Inhaler', category: 'Respiratory', price: 180.00, manufacturer: 'Generic Pharma', description: 'Quick relief for asthma', rating: 4.8, reviews_count: 1120, in_stock: true, requires_prescription: true },
      { name: 'Budesonide Inhaler', category: 'Respiratory', price: 450.00, manufacturer: 'Generic Pharma', description: 'Preventive asthma treatment', rating: 4.7, reviews_count: 780, in_stock: true, requires_prescription: true },
      { name: 'Clotrimazole Cream', category: 'Skin Care', price: 65.00, manufacturer: 'Generic Pharma', description: 'Antifungal cream for skin infections', rating: 4.5, reviews_count: 840, in_stock: true, requires_prescription: false },
      { name: 'Adapalene Gel 0.1%', category: 'Skin Care', price: 320.00, manufacturer: 'Generic Pharma', description: 'Acne treatment gel', rating: 4.6, reviews_count: 1240, in_stock: true, requires_prescription: false },
    ];

    allMedicines.push(...indianMedicines);

    console.log(`Total medicines to sync: ${allMedicines.length}`);
    console.log(`FDA medicines: ${successCount}, Failed: ${failCount}, Indian medicines: ${indianMedicines.length}`);

    // Insert medicines into database (upsert to avoid duplicates)
    const { data, error } = await supabaseServer
      .from('medicines')
      .upsert(allMedicines, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to sync medicines',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Medicines synced successfully',
      count: allMedicines.length,
      fdaCount: successCount,
      indianCount: indianMedicines.length,
      failedCount: failCount,
      medicines: data
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync medicines',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getCategoryFromProductType(productType: string, genericName: string): string {
  const type = productType.toLowerCase();
  const generic = genericName.toLowerCase();
  
  if (type.includes('pain') || generic.includes('pain') || generic.includes('ibuprofen') || generic.includes('aspirin') || generic.includes('acetaminophen')) return 'Pain Relief';
  if (type.includes('antibiotic') || type.includes('anti-infective') || generic.includes('cillin') || generic.includes('mycin')) return 'Antibiotic';
  if (type.includes('vitamin') || type.includes('supplement') || generic.includes('vitamin')) return 'Vitamins';
  if (type.includes('cardiovascular') || type.includes('cardiac') || generic.includes('statin') || generic.includes('pril')) return 'Cardiovascular';
  if (type.includes('diabetes') || type.includes('antidiabetic') || generic.includes('metformin') || generic.includes('insulin')) return 'Diabetes';
  if (type.includes('respiratory') || type.includes('asthma') || generic.includes('buterol')) return 'Respiratory';
  if (type.includes('gastro') || type.includes('antacid') || generic.includes('prazole')) return 'Gastric';
  if (type.includes('allergy') || type.includes('antihistamine') || generic.includes('cetirizine') || generic.includes('loratadine')) return 'Allergy';
  if (type.includes('derma') || type.includes('skin')) return 'Skin Care';
  if (generic.includes('sartan') || generic.includes('dipine')) return 'Blood Pressure';
  
  return 'General Medicine';
}

function generatePrice(category: string): number {
  const priceRanges: Record<string, [number, number]> = {
    'Pain Relief': [15, 50],
    'Antibiotic': [80, 200],
    'Diabetes': [80, 300],
    'Blood Pressure': [60, 150],
    'Cardiovascular': [100, 250],
    'Cholesterol': [120, 250],
    'Gastric': [30, 80],
    'Allergy': [25, 100],
    'Vitamins': [80, 400],
    'Respiratory': [150, 500],
    'Skin Care': [50, 350],
    'General Medicine': [40, 150],
  };

  const [min, max] = priceRanges[category] || [40, 150];
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * GET /api/medicines/sync
 * Returns sync status and medicine count
 */
export async function GET() {
  try {
    const { count, error} = await supabaseServer
      .from('medicines')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({ 
      synced: (count ?? 0) > 0,
      count: count ?? 0,
      message: `${count ?? 0} medicines in database`
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get sync status' 
    }, { status: 500 })
  }
}
