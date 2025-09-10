#!/usr/bin/env python3
"""
Currency Utilities for AI Inventory
Centralized currency detection and formatting functions
"""

import frappe


def get_report_currency(company=None):
    """
    Get currency for reporting based on company settings with proper fallback hierarchy
    
    Args:
        company (str, optional): Company name to get currency for
        
    Returns:
        str: Currency code (e.g., 'USD', 'INR', 'EUR')
    """
    # Try company-specific currency first
    if company:
        try:
            company_doc = frappe.get_doc("Company", company)
            if company_doc and company_doc.default_currency:
                return company_doc.default_currency
        except Exception:
            # Company might not exist or be accessible, continue with fallbacks
            pass
    
    # Try ERPNext Global Defaults
    try:
        default_currency = frappe.db.get_single_value("Global Defaults", "default_currency")
        if default_currency:
            return default_currency
    except Exception:
        pass
    
    # Try System Settings
    try:
        system_currency = frappe.db.get_single_value("System Settings", "currency")
        if system_currency:
            return system_currency
    except Exception:
        pass
    
    # Final fallback
    return "INR"


def format_currency(amount, currency=None, company=None):
    """
    Format currency amount using Frappe's formatting with proper currency detection
    
    Args:
        amount (float): Amount to format
        currency (str, optional): Currency code. If not provided, will be detected
        company (str, optional): Company name for currency detection
        
    Returns:
        str: Formatted currency string
    """
    if currency is None:
        currency = get_report_currency(company)
    
    try:
        return frappe.utils.fmt_money(amount, currency=currency)
    except Exception:
        # Fallback to basic formatting if frappe.utils.fmt_money fails
        return f"{currency} {amount:,.2f}"


def get_currency_symbol(currency=None, company=None):
    """
    Get currency symbol for display
    
    Args:
        currency (str, optional): Currency code. If not provided, will be detected
        company (str, optional): Company name for currency detection
        
    Returns:
        str: Currency symbol
    """
    if currency is None:
        currency = get_report_currency(company)
    
    # Common currency symbols mapping
    currency_symbols = {
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
    }
    
    return currency_symbols.get(currency, currency)