# app/models/lead_status_event.rb
class LeadStatusEvent < ApplicationRecord
  belongs_to :lead
  belongs_to :user, optional: true

  validates :to_status, presence: true
end
