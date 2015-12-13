class Person
  include Mongoid::Document
  include Mongoid::Timestamps
  include Mongoid::Userstamp

  mongoid_userstamp user_model: 'User'

  field :name,            type: String
  field :surname,         type: String
  field :origin,          type: String
  field :city,            type: String
  field :phone,           type: String
  field :menu,            type: String
  field :income,          type: String
  field :address,         type: String
  field :contact_family,  type: String
  field :notes,           type: String
  field :family_status,   type: String
  field :health_status,   type: String
  field :nif,             type: String
  field :exp,             type: String
  field :zts,             type: String
  field :assistance,      type: Integer
  field :social_services, type: Integer
  field :documentation,   type: Integer
  field :address_type,    type: Integer
  field :residence,       type: Integer
  field :have_income,     type: Integer
  field :genre,           type: Symbol
  field :birth,           type: Date
  field :entry,           type: Date
  field :output,          type: Date

  has_many :used_services
  has_many :alerts
  has_many :histories
  has_many :articles
  has_many :attachments

  validates :name,        presence: true
  validates :surname,     presence: true
  validates :origin,      presence: true
  validates :genre,       inclusion: { in: [:man, :woman] }

  after_create do |document|
    set(exp: "%05d" % Person.all.size)
  end

  def is_spanish
    if (self.origin != nil)
      if (self.origin.downcase == "españa" || self.origin.upcase == "ESPAÑA")
        return true
      else
        return false
      end
    end
  end

  # Método que devolverá usos de servicio para el día en que se pida
  def used_services_of_selected_day

    resultado = used_services.where(:created_at => $selected_day ).map do |used_service|
      [used_service.service.name, true]
    end
    Hash[resultado]
  end

  # Método que devolverá usos de servicio para el día en que se pida con su id
  def used_services_of_selected_day_id

    resultado = used_services.where(:created_at => $selected_day ).map do |used_service|
      [used_service.service.name, used_service.id.to_s]
    end
    Hash[resultado]
  end

  # Método que devuelve las alertas pendientes
  def pending_alerts
    alerts.where(:pending.gte => $selected_day).desc(:created_at)
  end

end
