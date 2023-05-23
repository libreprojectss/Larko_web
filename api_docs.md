# API Documentation

This documentation provides details about the available endpoints and their functionalities for the specified Django application.

## Waitlist App Endpoints

### Base Url
The base url for the api in this app is `http://Your domain here/api/customer` 

### 1. Get Required Fields

- URL: `/getrequiredfields/`
- Method: GET
- Description: Retrieves the fields information  which includes required or selected fields.
               Required fields are the fields which are required to be input and selected are those which are selected to be input including required and optional fields.
- Returns: JSON response containing the required fields data.

### 2. Get All Fields

- URL: `/allfields/`
- Method: GET,POST
- Description: 
      - Get: Retrieves all fields information.Post method to it saves the fields values
      - POST: Modifies the fields values
- Returns: JSON response containing the all fields data.

### 3. Waitlist

- URL: `/waitlist/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the waitlist data.
  - POST: Creates a new waitlist entry.
- Returns: 
  - GET: JSON response containing the waitlist data.
  - POST: JSON response confirming the successful creation of the waitlist entry.

### 4. Waitlist Modify

- URL: `/waitlist/<str:pk>/`
- Method: PUT,DELETE,GET
- Description: Retrieves detailed information about a specific waitlist entry.Also edit and 
               modify waitlist
- Returns: JSON response containing the waitlist entry data.

### 5. Notes

- URL: `/notes/<str:cid>/`
- Method: GET
- Description: Retrieves notes associated with a specific customer ID.
- Returns: JSON response containing the notes data.

### 6. Notes Detail

- URL: `/notes/<str:cid>/<str:nid>/`
- Method: GET
- Description: Retrieves detailed information about a specific note for a customer.
- Returns: JSON response containing the note data.

### 7. Get Service Name

- URL: `/getservicename/`
- Method: GET
- Description: Retrieves the service names.
- Returns: JSON response containing the service names.

### 8. Services

- URL: `/services/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the services data.
  - POST: Creates a new service entry.
- Returns: 
  - GET: JSON response containing the services data.
  - POST: JSON response confirming the successful creation of the service entry.

### 9. Services Edit/Delete

- URL: `/services/<str:pk>/`
- Method: GET, PUT, DELETE
- Description: 
  - GET: Retrieves detailed information about a specific service.
  - PUT: Updates the information of a specific service.
  - DELETE: Deletes a specific service.
- Returns: 
  - GET: JSON response containing the service data.
  - PUT: JSON response confirming the successful update of the service.
  - DELETE: JSON response confirming the successful deletion of the service.

### 10. Serving List

- URL: `/serving/<str:pk>/`
- Method: GET
- Description: Retrieves a list of customers to be served based on the waitlist ID provided.
- Returns: JSON response containing the list of customers to be served.

### 11. Serving

- URL: `/serving/`
- Method: GET
- Description: Retrieves the list of customers to be served.
- Returns: JSON response containing the list of customers to be served.

### 12. Served List

- URL: `/served/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the list of served customers.
  - POST: Adds a customer to the served list.
- Returns: 
  - GET: JSON response containing the list of served customers.
  - POST: JSON response confirming the successful addition of the customer to the served list.

### 13. Served History

- URL: `/served/<str:pk>/`
- Method: GET
- Description:

 Retrieves the serving history of a specific customer.
- Returns: JSON response containing the serving history data.

### 14. Resources

- URL: `/resources/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the resources data.
  - POST: Creates a new resource entry.
- Returns: 
  - GET: JSON response containing the resources data.
  - POST: JSON response confirming the successful creation of the resource entry.

### 15. Resources Edit/Delete

- URL: `/resources/<str:pk>/`
- Method: GET, PUT, DELETE
- Description: 
  - GET: Retrieves detailed information about a specific resource.
  - PUT: Updates the information of a specific resource.
  - DELETE: Deletes a specific resource.
- Returns: 
  - GET: JSON response containing the resource data.
  - PUT: JSON response confirming the successful update of the resource.
  - DELETE: JSON response confirming the successful deletion of the resource.

### 16. Analytics

- URL: `/analytics/<str:pk>/`
- Method: GET
- Description: Retrieves analytics data for a specific customer.
- Returns: JSON response containing the analytics data.

### 17. Send SMS Notification

- URL: `/sendsms/<str:pk>/`
- Method: GET
- Description: Sends an SMS notification to a specific customer.
- Returns: JSON response confirming the successful sending of the SMS notification.

### 18. Validate Customer Token

- URL: `/validatetoken/`
- Method: GET
- Description: Validates the customer token.
- Returns: JSON response confirming the validation of the token.

### 19. Validate Customer Token Detail

- URL: `/validatetoken/<str:pk>/`
- Method: GET
- Description: Validates the customer token for a specific customer.
- Returns: JSON response confirming the validation of the token for the customer.

### 20. Download Records

- URL: `/downloadrecords/`
- Method: GET
- Description: Downloads the records.
- Returns: File download response containing the records.

## Account App Endpoints
### Base Url
    The base url for the api in this app is `http://Your domain here/api/user` 
### 1. Token Refresh

- URL: `/token/update/`
- Method: POST
- Description: Refreshes the authentication token.
- Returns: JSON response containing the refreshed token.

### 2. Token Verify

- URL: `/token/verify/`
- Method: POST
- Description: Verifies the authentication token.
- Returns: JSON response confirming the verification of the token.

### 3. Sign Up

- URL: `/signup/`
- Method: POST
- Description: Creates a new user account.
- Returns: JSON response confirming the successful creation of the user account.

### 4. Login

- URL: `/login/`
- Method: POST
- Description: Logs in the user and returns an authentication token.
- Returns: JSON response containing the authentication token.

### 5. Check Business Name

- URL: `/checkbusinessname/`
- Method: POST
- Description: Checks the availability of a business name.
- Returns: JSON response confirming the availability of the business name.

### 6. Business Profile

- URL: `/businessprofile/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the business profile information.
  - POST: Updates the business profile information.
- Returns: 
  - GET: JSON response containing the business profile data.
  - POST: JSON response confirming the successful update of the business profile.

### 7. Open/Close Business

- URL: `/openclosebusiness/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the information about whether the business is open or closed.
  -

 POST: Updates the business status as open or closed.
- Returns: 
  - GET: JSON response containing the open/close business status.
  - POST: JSON response confirming the successful update of the business status.

### 8. Open/Close Business Detail

- URL: `/openclosebusiness/<str:pk>/`
- Method: POST
- Description: Updates the business status as open or closed for a specific business.
- Returns: JSON response confirming the successful update of the business status.

### 9. Open/Close Public Link

- URL: `/openclosepubliclink/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the information about whether the public self-checkins are open or closed.
  - POST: Updates the public self-checkins status as open or closed.
- Returns: 
  - GET: JSON response containing the open/close public self-checkins status.
  - POST: JSON response confirming the successful update of the public self-checkins status.

### 10. Open/Close Public Link Detail

- URL: `/openclosepubliclink/<str:pk>/`
- Method: POST
- Description: Updates the public self-checkins status as open or closed for a specific business.
- Returns: JSON response confirming the successful update of the public self-checkins status.

### 11. Operation Schedule

- URL: `/operationschedule/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the operation schedule for the business.
  - POST: Updates the operation schedule for the business.
- Returns: 
  - GET: JSON response containing the operation schedule data.
  - POST: JSON response confirming the successful update of the operation schedule.

### 12. Open/Close Validation

- URL: `/openclosevalidation/`
- Method: GET, POST
- Description: 
  - GET: Retrieves the information about whether the open/close validation is active or not.
  - POST: Updates the open/close validation status as active or inactive.
- Returns: 
  - GET: JSON response containing the open/close validation status.
  - POST: JSON response confirming the successful update of the open/close validation status.

### 13. Open/Close Validation Detail

- URL: `/openclosevalidation/<str:pk>/`
- Method: POST
- Description: Updates the open/close validation status as active or inactive for a specific business.
- Returns: JSON response confirming the successful update of the open/close validation status.

### 14. Auto Attributes

- URL: `/autoattributes/`
- Method: GET
- Description: Retrieves the auto attributes.
- Returns: JSON response containing the auto attributes data.

## Joinlink App Endpoints

### Base Url
    The base url for the api in this app is `http://Your domain here/api/` 

### 1. Join Waitlist

- URL: `/joinwaitlist/<uuid:pk>/`
- Method: GET
- Description: Joins the waitlist with a specific UUID.
- Returns: JSON response confirming the successful joining of the waitlist.

### 2. Remove Data from Public Link

- URL: `/publiclink/removedata/<uuid:pk>/`
- Method: DELETE
- Description: Removes data from the public link with a specific UUID.
- Returns: JSON response confirming the successful removal of the data.

### 3. Get Required Fields for Public Link

- URL: `/publiclink/getrequiredfields/<uuid:pk>/`
- Method: GET
- Description: Retrieves the required fields and available services for the public link with a specific UUID.
- Returns: JSON response containing the required fields and available services data.

### 4. Check Queue Status

- URL: `/publiclink/checkqueuestatus/<uuid:pk>/`
- Method: GET
- Description: Checks the queue status for the public link alon with details about other in the queue

 a specific UUID.
- Returns: JSON response containing the queue status data.



## Conclusion

This API documentation provides an overview of the available endpoints and their functionalities for the Waitlist and Account Django applications. You can refer to this documentation to understand how to interact with the API and perform various actions such as retrieving waitlist data, creating new entries, updating business information, joining the waitlist through a public link, and more. Make sure to use the appropriate HTTP methods and provide the required parameters for each endpoint to interact with the API successfully.