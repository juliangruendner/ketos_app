# Overview Repo - SMART on FHIR Apps

SMART apps are an infrastructure convention for delpoying apps in combination with FHIR webservices and a dedicated oauth server.

They rely on a connection library (e.g. fhir-client.js) to take care of all the fhir and oauth interactions.

website: http://docs.smarthealthit.org/

as the website describes it:

"SMART on FHIR is a set of open specifications to integrate apps with Electronic Health Records, portals, Health Information Exchanges, and other Health IT systems. You get… FHIR, OAuth2, OpenID Connect, HTML5"

This repo contains example apps from fhir and eventually our own basic example app, which allows an easier introduction to the fhir app infrastructure


# Note the Installer - (why we dont use it)

The Smart on fhir group also provides an installer (https://github.com/smart-on-fhir/installer), however in order to integrate the individual components with our environment (docker based rather than virtual machine based) of this Development repository we take single bits of their repos.

# The SMART Apps

This Repo contains 4 smart apps taken from the installer repository, one of which has been configured to run properly.

However the Apps do not seem to follow a clear structure or use a specific framework, further the examples already have a fair amount of complexity, this is why we will provide our own simple working example in a useful framework, which will make implementing future apps a lot quicker.

# Smart example App

The smart app growth-chart in the example_apps folder works already, to try it do the following:

1. Navigate to example_apps/growth-chart and type the following in your console

```
npm install
npm start
```

go to your browser of choice and paste the following url:

http://localhost:9000/launch.html?fhirServiceUrl=http://gruendner.de:8080/gtfhir/base&patientId=1

logic of url

<baseurl of app host>/launch.html?fhirServiceUrl=<url of chosen fhir server api base (usually url/base)>&patientId=<id of chosen patient>

this accesses our gtfhir server and throws an error.
In your browser open your Console and check - you can see a 400 - not found error as the resource "FamilyMemberHistory" is not available on our server - however it shows that the communication works

