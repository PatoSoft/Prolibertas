class PersonSerializer < ActiveModel::Serializer
  attributes :id, :name, :surname, :origin, :genre, :phone, :assistance, :family_status, :health_status, :birth, :nif, :social_services, :menu,:income, :address, :contact_family, :notes, :used_services_of_selected_day, :used_services_of_selected_day_id, :pending_alerts, :residence, :have_income, :city, :is_spanish, :documentation, :address_type, :exp, :created_by, :entry, :output, :zts
end
