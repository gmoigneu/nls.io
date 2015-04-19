---
title: "Rails - Find an entity via slug or another unique field"
published: true
date: 01/27/2014 11:00pm
taxonomy:
    category: blog
    tag: [rails, slug]
---

Using friendly_id to map the slug to the entity.

===

Sometimes you need to show an entity content based on a customized client request. For example, we have a classic Request object that contains a unique_id generated when the object is created : ## Request.rb

    class Request &lt; ActiveRecord::Base
        attr_accessible :address, :email, :first_name, :foursquare_id, :geocode, :last_name, :latitude, :longitude, :phone, :status, :location_type, :unique_id

        validates_presence_of :phone
        before_create :make_unique_id

        # Define a very unique_id by checking if one exists
        def make_unique_id
            charset = %w{ 2 3 4 6 7 9 a c d e f h h j k m n p q r t v w x y z}
            self.unique_id = (0...6).map{ charset.to_a[rand(charset.size)] }.join
            if Request.find_by_unique_id(self.unique_id)
                self.make_unique_id
            end
        end
    end

## requests_controller.rb 

Ok now we want our controller to be able to retrieve our object by this :unique_id. Our controller is just :

    # GET /requests/1
    def show
        expose Request.find(params[:id])
    end

That code remains unchanged as we now need to also map :id to our :unique_id ## friendly_id For that purpose we will be using the friendly_id gem available. Just add its name to your Gemfile :

    gem 'friendly_id'

And run :

    bundle install

Now we just need to mark our :unique_id field as a friendly one in our Request.rb class file :

    extend FriendlyId
    friendly_id :unique_id

## _create_requests.rb

The last step is to adapt your migration file to index this file (more a performance advice than a requirement). Just add a new index :

    add_index :requests, :unique_id

And run your migration through :

    rake db:migrate

## Enjoy ! 

Your controller can now retrieve your object with the :unique_id as a parameter.

    http://localhost:3000/requests/1
    http://localhost:3000/requests/jh7cc9

Both these requests should now output the same result !