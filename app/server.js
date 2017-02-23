var ags = require('arcgis-api-client');
var featureServerUrl = 'http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0';
var featureServer = new ags.FeatureServer({ featureServerUrl });
var PDFDocument = require('pdfkit');
var request = require('request');
var fs = require('fs');
var data = null;
var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = mailer.createTransport(smtpTransport({
   host: 'cormailgw2.raleighnc.gov',
   port: 25
}));
request.post("http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/query", {form: {f: 'json', outFields: '*', where: 'Status = 1', returnGeometry: 'false'}}, function (error, response, body) {
  data = body;
  data = JSON.parse(data);

  console.log(data.features.length);
  data.features.forEach(function (feature) {
    var doc = new PDFDocument();
    doc.font('Helvetica');
    doc.fontSize(40).text("Due Diligence Report");
    doc.font('Helvetica-Bold').fontSize(26);
    console.log(feature);
    data.fields.forEach(function (field) {
      if (field.domain) {
        var filtered = field.domain.codedValues.filter(function (item) {
          return item.code === feature.attributes[field.name];
        });
        if (filtered.length > 0) {
          feature.attributes[field.name] = filtered[0].name;
        }
      }
    });

    doc.font('Helvetica').text("Information");
    doc.font('Helvetica-Bold').fontSize(16);
    doc.font('Helvetica').text("Prepared For: " + feature.attributes.contact);
    doc.font('Helvetica').text("Project Name: " + feature.attributes.project);
    doc.font('Helvetica').text("Addresses Selected: " + feature.attributes.address);
    doc.font('Helvetica').text("PIN #s Selected: " + feature.attributes.pins);
    doc.font('Helvetica').text("raleighnc.gov", {link: 'https://www.raleighnc.gov', underline: true});
    doc.font('Helvetica').text(" ");
    doc.font('Helvetica-Bold').fontSize(26).text("Planning Answers");
    doc.font('Helvetica-Bold').fontSize(16).text("What are the zoning codes for this site?");
    doc.font('Helvetica').text(feature.attributes.planning1);
    doc.font('Helvetica-Bold').fontSize(16).text("Are there zoning conditions?");
    doc.font('Helvetica').text(feature.attributes.planning2);
    doc.font('Helvetica-Bold').fontSize(16).text("Are there zoning overlays?");
    doc.font('Helvetica').text(feature.attributes.planning3);
    doc.font('Helvetica-Bold').fontSize(16).text("What is the frontage?");
    doc.font('Helvetica').text(feature.attributes.planning4);
    doc.font('Helvetica-Bold').fontSize(16).text("Max building height (stories)");
    doc.font('Helvetica').text(feature.attributes.planning5);
    doc.font('Helvetica-Bold').fontSize(16).text("Max density (units/acres)");
    doc.font('Helvetica').text(feature.attributes.planning6);
    doc.font('Helvetica-Bold').fontSize(16).text("Allowable Building Types");
    doc.font('Helvetica').text(feature.attributes.planning7);
    doc.font('Helvetica-Bold').fontSize(16).text("Additional Comments");
    doc.font('Helvetica').text(feature.attributes.planning8);
    doc.font('Helvetica').text(" ");
    doc.font('Helvetica-Bold').fontSize(26).text("Urban Forestry Answers");
    doc.font('Helvetica-Bold').fontSize(16).text("Is the property in question 2 acres or greater?");
    doc.font('Helvetica').text(feature.attributes.forestry1);
    if (feature.attributes.forestry1 === "Yes") {
      doc.font('Helvetica-Bold').fontSize(16).text("How much tree conservation is required based on the parcels zoning?");
      doc.font('Helvetica').text(feature.attributes.forestry2);
      doc.font('Helvetica-Bold').fontSize(16).text("Is there existing tree conservation on the property?");
      doc.font('Helvetica').text(feature.attributes.forestry3);
    }

    doc.font('Helvetica-Bold').fontSize(16).text("What areas would be considered for tree conservation?");
    doc.font('Helvetica').text(feature.attributes.forestry4);
    doc.font('Helvetica-Bold').fontSize(16).text("Is the project located in a watershed protection overlay district (Urban, Falls,Swift Creek)?");
    doc.font('Helvetica').text(feature.attributes.forestry5);
    doc.font('Helvetica-Bold').fontSize(16).text("Will street trees be required as part of the development of the parcels?");
    doc.font('Helvetica').text(feature.attributes.forestry6);
    doc.font('Helvetica-Bold').fontSize(16).text("Additional Comments");

    doc.font('Helvetica').text(" ");
    doc.font('Helvetica-Bold').fontSize(26).text("Public Utilities Answers");
    doc.font('Helvetica-Bold').fontSize(16).text("Will I be required to extend water along any public rights of way?");
    doc.font('Helvetica').text(feature.attributes.utilities1);
    doc.font('Helvetica-Bold').fontSize(16).text("Will I be requrired to extend sewer to any adjacent upstream properties?");
    doc.font('Helvetica').text(feature.attributes.utilities2);
    doc.font('Helvetica-Bold').fontSize(16).text("Are there any water pressure or sewer capacity concerns?");
    doc.font('Helvetica').text(feature.attributes.utilities3);
    doc.font('Helvetica-Bold').fontSize(16).text("Will an off-site sanitary sewer easement be required?");
    doc.font('Helvetica').text(feature.attributes.utilities4);
    doc.font('Helvetica-Bold').fontSize(16).text("Is there a pending water and/or sewer assessment on my property?");
    doc.font('Helvetica').text(feature.attributes.utilities5);
    doc.font('Helvetica-Bold').fontSize(16).text("Additional Comments");
    doc.font('Helvetica').text(feature.attributes.utilities6);


    doc.pipe(fs.createWriteStream(feature.attributes.OBJECTID + '.pdf'));
    featureServer.addAttachment({ objId: feature.attributes.OBJECTID, filePath: "/Users/grecoj/due-diligence-pdf/app/" + feature.attributes.OBJECTID + '.pdf' }).then(function (result) {
        console.log(22222);
        console.log('FeatureServer addAttachment result: ', result); // { success: true }
      });
    //fs.readFile(feature.attributes.OBJECTID + '.pdf', function (err, data) {
      doc.end();
      // transporter.sendMail({
      //     from: 'gis@raleighnc.gov',
      //     to: 'justin.greco@raleighnc.gov',
      //     subject: 'Due Diligence',
      //     text: 'mail content...',
      //     attachments: [{'filename': feature.attributes.OBJECTID + '.pdf', 'path': './' + feature.attributes.OBJECTID + '.pdf', contentType: 'application/pdf'}]
      // });
  //  doc.font('Helvetica').text(JSON.stringify(feature));
  });

});
