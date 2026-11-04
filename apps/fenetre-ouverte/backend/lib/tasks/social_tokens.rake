namespace :social do
  desc "Chiffrer idempotemment les anciens jetons OAuth en clair (sauvegarder la DB avant exécution)."
  task encrypt_legacy_tokens: :environment do
    migrated = 0
    SocialAccount.find_each do |account|
      before = [account[:access_token], account[:refresh_token]]
      account.encrypt_legacy_token_fields
      next if before == [account[:access_token], account[:refresh_token]]

      account.save!(validate: false)
      migrated += 1
    end
    puts "Comptes sociaux migrés : #{migrated}. Stocker et préserver la clé Rails pour conserver l'accès aux jetons."
  end
end
