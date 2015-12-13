class PeopleController < ApplicationController
  respond_to :json
  load_and_authorize_resource param_method: :person_params

  def show
    respond_with @person
  end

  def index
    $selected_day = params[:selected_day]
    @people = Person.all
    respond_with @people
  end

  def create
    @person = Person.create(person_params)
    respond_with @person
  end

  def update
    @person.update_attributes(person_params)
    respond_with @person
  end

  def destroy
    @person.destroy
    respond_with @person
  end

  def individual_report
    @individual_report = UsedService.where( person_id: params[:id] ).desc(:created_at).map do |used_service|
      [used_service.created_at.to_s.split('-').reverse.join('/'), used_service.service.name, used_service.created_by.full_name]
    end

     respond_with @individual_report.to_json
  end

  private

  def person_params
    params.require(:person).permit(
      :id, :name, :surname, :origin, :genre, :phone, :assistance, :family_status, :health_status, :birth, :nif, :social_services, :menu, :income, :address, :contact_family, :notes, :documentation, :address_type, :city, :residence, :have_income, :entry, :output, :zts
      )
  end
end
