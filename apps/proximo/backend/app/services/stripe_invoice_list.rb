# app/services/stripe_invoice_list.rb
class StripeInvoiceList
  def self.for_customer(customer_id, limit: 12)
    return [] if customer_id.blank? || ENV["STRIPE_SECRET_KEY"].blank?

    invoices = Stripe::Invoice.list(customer: customer_id, limit: limit)
    invoices.data.map { |invoice| serialize(invoice) }
  rescue Stripe::StripeError => e
    Rails.logger.warn("Stripe invoice list failed: #{e.message}")
    []
  end

  def self.serialize(invoice)
    {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due_cents: invoice.amount_due,
      amount_paid_cents: invoice.amount_paid,
      currency: invoice.currency,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      period_end: invoice.period_end ? Time.zone.at(invoice.period_end).iso8601 : nil,
      created: invoice.created ? Time.zone.at(invoice.created).iso8601 : nil
    }
  end

  private_class_method :serialize
end
