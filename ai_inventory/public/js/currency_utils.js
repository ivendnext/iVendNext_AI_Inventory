/**
 * Currency Utilities for AI Inventory
 * Centralized currency detection and formatting functions for JavaScript
 */

// Cache for company currency lookups to avoid repeated queries
let currencyCache = {};

/**
 * Get currency for reporting based on company settings with proper fallback hierarchy
 * @param {string} company - Optional company name to get currency for
 * @returns {string} Currency code (e.g., 'USD', 'INR', 'EUR')
 */
function get_report_currency(company) {
    // Check cache first
    if (company && currencyCache[company]) {
        return currencyCache[company];
    }
    
    // Try company-specific currency first
    if (company) {
        try {
            let company_doc = frappe.get_doc('Company', company);
            if (company_doc && company_doc.default_currency) {
                currencyCache[company] = company_doc.default_currency;
                return company_doc.default_currency;
            }
        } catch (e) {
            // Company might not exist or be accessible, continue with fallbacks
        }
    }
    
    // Try global default currency
    try {
        let default_currency = frappe.defaults.get_default('currency');
        if (default_currency) {
            return default_currency;
        }
    } catch (e) {
        // Continue with fallbacks
    }
    
    // Try system default
    try {
        let system_currency = frappe.sys_defaults.currency;
        if (system_currency) {
            return system_currency;
        }
    } catch (e) {
        // Continue with fallbacks
    }
    
    // Final fallback
    return 'INR';
}

/**
 * Format currency amount using Frappe's formatting with proper currency detection
 * @param {number} amount - Amount to format
 * @param {string} currency - Optional currency code. If not provided, will be detected
 * @param {string} company - Optional company name for currency detection
 * @returns {string} Formatted currency string
 */
function format_currency_js(amount, currency, company) {
    if (currency === undefined || currency === null) {
        currency = get_report_currency(company);
    }
    
    try {
        return frappe.format(amount, {
            fieldtype: 'Currency',
            options: currency
        });
    } catch (e) {
        // Fallback to basic formatting if frappe.format fails
        return `${currency} ${amount.toLocaleString()}`;
    }
}

/**
 * Get currency symbol for display
 * @param {string} currency - Optional currency code. If not provided, will be detected
 * @param {string} company - Optional company name for currency detection
 * @returns {string} Currency symbol
 */
function get_currency_symbol(currency, company) {
    if (currency === undefined || currency === null) {
        currency = get_report_currency(company);
    }
    
    // Common currency symbols mapping
    const currency_symbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'Fr',
        'SGD': 'S$',
        'AED': 'د.إ',
        'SAR': '﷼'
    };
    
    return currency_symbols[currency] || currency;
}

/**
 * Clear currency cache (useful when company settings change)
 */
function clear_currency_cache() {
    currencyCache = {};
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        get_report_currency,
        format_currency_js,
        get_currency_symbol,
        clear_currency_cache
    };
}