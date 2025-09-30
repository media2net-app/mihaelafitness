import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting cleanup of orphaned pricing calculations...');
    
    // Find pricing calculations with the specific customer IDs that are causing the "Unknown Customer" issue
    const targetCustomerIds = 'cmg6zv6m60007bpfhus2h1xt0,cmg6zross0000bpfhmmlei3gr';
    
    const pricingToDelete = await prisma.pricingCalculation.findMany({
      where: {
        customerId: targetCustomerIds
      }
    });
    
    console.log(`Found ${pricingToDelete.length} pricing calculations to delete:`);
    pricingToDelete.forEach(p => {
      console.log(`  - ID: ${p.id}`);
      console.log(`    Customer: ${p.customerName}`);
      console.log(`    Service: ${p.service}`);
      console.log(`    Price: ${p.finalPrice} RON`);
    });
    
    let deletedPricingCount = 0;
    if (pricingToDelete.length > 0) {
      // Delete the pricing calculations
      const deleteResult = await prisma.pricingCalculation.deleteMany({
        where: {
          customerId: targetCustomerIds
        }
      });
      
      deletedPricingCount = deleteResult.count;
      console.log(`✅ Deleted ${deleteResult.count} pricing calculations`);
    }
    
    // Also check for any payments with those customer IDs
    const paymentsToDelete = await prisma.payment.findMany({
      where: {
        customerId: {
          in: targetCustomerIds.split(',')
        }
      }
    });
    
    let deletedPaymentsCount = 0;
    if (paymentsToDelete.length > 0) {
      console.log(`Found ${paymentsToDelete.length} payments to delete:`);
      paymentsToDelete.forEach(p => {
        console.log(`  - ID: ${p.id}`);
        console.log(`    Customer ID: ${p.customerId}`);
        console.log(`    Amount: ${p.amount} RON`);
      });
      
      const deletePaymentsResult = await prisma.payment.deleteMany({
        where: {
          customerId: {
            in: targetCustomerIds.split(',')
          }
        }
      });
      
      deletedPaymentsCount = deletePaymentsResult.count;
      console.log(`✅ Deleted ${deletePaymentsResult.count} payments`);
    }
    
    console.log('🎉 Cleanup completed!');
    
    return NextResponse.json({
      success: true,
      deletedPricing: deletedPricingCount,
      deletedPayments: deletedPaymentsCount,
      message: `Deleted ${deletedPricingCount} pricing calculations and ${deletedPaymentsCount} payments`
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup orphaned data' },
      { status: 500 }
    );
  }
}
