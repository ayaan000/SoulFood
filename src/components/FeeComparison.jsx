import React from 'react';
import { TrendingDown, AlertCircle } from 'lucide-react';

export default function FeeComparison({ subtotal }) {
    // Uber Eats typical fees in Toronto (based on 2024 data)
    const UBER_EATS_SERVICE_FEE_PERCENT = 0.15; // 15% service fee
    const UBER_EATS_SMALL_ORDER_FEE = subtotal < 15 ? 3.99 : 0;
    const UBER_EATS_REGULATORY_FEE = subtotal * 0.02; // ~2% regulatory fee

    const uberEatsServiceFee = subtotal * UBER_EATS_SERVICE_FEE_PERCENT;
    const uberEatsTotalFees = uberEatsServiceFee + UBER_EATS_SMALL_ORDER_FEE + UBER_EATS_REGULATORY_FEE;
    const uberEatsTotal = subtotal + uberEatsTotalFees;

    const soulFoodTotal = subtotal; // No markup or fees
    const savings = uberEatsTotalFees;
    const savingsPercent = ((savings / uberEatsTotal) * 100).toFixed(0);

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 my-4">
            <div className="flex items-start gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingDown className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">You're Saving with Soul Food!</h3>
                    <p className="text-xs text-gray-600">Comparison with Uber Eats fees</p>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                {/* Uber Eats breakdown */}
                <div className="bg-white/70 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-700">Uber Eats</span>
                        <span className="text-sm font-bold text-red-600">${uberEatsTotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                            <span>Food</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service Fee (15%)</span>
                            <span className="text-red-600">+${uberEatsServiceFee.toFixed(2)}</span>
                        </div>
                        {UBER_EATS_SMALL_ORDER_FEE > 0 && (
                            <div className="flex justify-between">
                                <span>Small Order Fee</span>
                                <span className="text-red-600">+${UBER_EATS_SMALL_ORDER_FEE.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Regulatory Fee (~2%)</span>
                            <span className="text-red-600">+${UBER_EATS_REGULATORY_FEE.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Soul Food breakdown */}
                <div className="bg-green-100 rounded-lg p-3 border-2 border-green-300">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-700">Soul Food</span>
                        <span className="text-sm font-bold text-green-700">${soulFoodTotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                            <span>Food</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-green-700">
                            <span>Platform Fees</span>
                            <span>$0.00</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Savings highlight */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3 text-center">
                <div className="text-xs font-medium mb-1">You Save</div>
                <div className="text-2xl font-bold">${savings.toFixed(2)}</div>
                <div className="text-xs opacity-90 mt-1">{savingsPercent}% less than Uber Eats</div>
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <p>
                    This saves the restaurant ${(subtotal * 0.30).toFixed(2)} in commission fees (30% typical rate).
                    Everyone wins except the middleman!
                </p>
            </div>
        </div>
    );
}
