# app/serializers/concerns/attachment_urls.rb
module AttachmentUrls
  module_function

  def blob_path(attachment)
    return nil if attachment.nil?

    case attachment
    when ActiveStorage::Attached::One
      return nil unless attachment.attached?

      rails_blob_path(attachment)
    when ActiveStorage::Attachment
      rails_blob_path(attachment)
    else
      nil
    end
  end

  def blob_paths(attachments)
    return [] if attachments.nil?

    records =
      if attachments.is_a?(ActiveStorage::Attached::Many)
        attachments.attachments
      else
        Array(attachments)
      end

    records.filter_map { |attachment| blob_path(attachment) }
  end

  def rails_blob_path(attachment)
    Rails.application.routes.url_helpers.rails_blob_path(attachment, only_path: true)
  end
end
