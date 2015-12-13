require 'rails_helper'
RSpec.describe Person, type: :model do
  context "Document" do
    it { is_expected.to be_timestamped_document }
  end

  context "Fields" do
    it { is_expected.to have_field( :name           ).of_type(String) }
    it { is_expected.to have_field( :surname        ).of_type(String) }
    it { is_expected.to have_field( :origin         ).of_type(String) }
    it { is_expected.to have_field( :phone          ).of_type(String) }
    it { is_expected.to have_field( :family_status  ).of_type(String) }
    it { is_expected.to have_field( :health_status  ).of_type(String) }
    it { is_expected.to have_field( :city           ).of_type(String) }
    it { is_expected.to have_field( :nif            ).of_type(String) }
    it { is_expected.to have_field( :menu           ).of_type(String) }
    it { is_expected.to have_field( :income         ).of_type(String) }
    it { is_expected.to have_field( :address        ).of_type(String) }
    it { is_expected.to have_field( :contact_family ).of_type(String) }
    it { is_expected.to have_field( :notes          ).of_type(String) }
    it { is_expected.to have_field( :exp            ).of_type(String) }
    it { is_expected.to have_field( :zts            ).of_type(String) }

    it { is_expected.to have_field( :assistance      ).of_type(Integer) }
    it { is_expected.to have_field( :social_services ).of_type(Integer) }
    it { is_expected.to have_field( :documentation   ).of_type(Integer) }
    it { is_expected.to have_field( :address_type    ).of_type(Integer) }
    it { is_expected.to have_field( :residence       ).of_type(Integer) }
    it { is_expected.to have_field( :have_income     ).of_type(Integer) }

    it { is_expected.to have_field( :birth  ).of_type(Date) }
    it { is_expected.to have_field( :entry  ).of_type(Date) }
    it { is_expected.to have_field( :output ).of_type(Date) }

    it { is_expected.to have_field( :genre  ).of_type(Symbol) }
  end

  context "Relations" do
    it { is_expected.to have_many(:used_services) }
    it { is_expected.to have_many(:alerts) }
    it { is_expected.to have_many(:histories) }
    it { is_expected.to have_many(:articles) }
    it { is_expected.to have_many(:attachments) }
  end

  context "Validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:surname) }
    it { is_expected.to validate_presence_of(:origin) }
    it { is_expected.to validate_inclusion_of(:genre).to_allow([:man, :woman]) }
  end

  context "custom methods" do
    context "#is_spanish" do
      it "should return true if origin is 'España'" do
        persona = FactoryGirl.create(:person, origin: "España")
        expect(persona.is_spanish).to eql(true)
      end

      it "should return false if origin is not 'España'" do
        persona = FactoryGirl.create(:person, origin: "Italia")
        expect(persona.is_spanish).to eql(false)
      end
    end

    context "#used_services_of_today" do
      it "should return used services of today" do
        # Estos datos son para crear un servicio usado por la persona(comida, ducha)
        persona = FactoryGirl.create(:person)
        comida = Service.where(name: 'comida').first
        ducha = Service.where(name: 'ducha').first
        FactoryGirl.create(:used_service, person: persona, service: comida)
        FactoryGirl.create(:used_service, person: persona, service: ducha)

        expect(persona.used_services_of_selected_day).to eql({'comida' => true, 'ducha' => true})
      end
    end

    context "#used_services_of_today_id" do
      it "should return used services of today with id" do
        # Estos datos son para crear un servicio usado por la persona(comida, ducha)
        persona = FactoryGirl.create(:person)
        comida = Service.where(name: 'comida').first
        ducha = Service.where(name: 'ducha').first
        servicio_comida = FactoryGirl.create(:used_service, person: persona, service: comida)
        servicio_ducha = FactoryGirl.create(:used_service, person: persona, service: ducha)

        expect(persona.used_services_of_selected_day_id)
          .to eql({'comida' => servicio_comida.id.to_s, 'ducha' => servicio_ducha.id.to_s})
      end
    end

    context "#pending_alerts" do
      it "should return the alerts from de future" do
        persona = FactoryGirl.create(:person)
        alertPass = FactoryGirl.create(:alert, person: persona, pending: 2.months.until)

        expect(persona.pending_alerts).to_not include(alertPass)
      end
    end
  end
end
