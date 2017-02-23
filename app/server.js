var pdfMake = require('pdfmake');
var fs = require('fs');
var request = require('request');
var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fonts = {
        Roboto: {
            normal: '../fonts/Roboto-Regular.ttf',
            bold: '../fonts/Roboto-Medium.ttf',
            italics: '../fonts/Roboto-Italic.ttf',
            bolditalics: '../fonts/Roboto-Italic.ttf'
        }
    };
var PdfPrinter = require('pdfmake/src/printer');
var printer = new PdfPrinter(fonts);
var sendAttachment = function (url, file) {
  var rs = fs.createReadStream(file);
  var r = request.post(url, function (err, resp, body) {
  });
  var form = r.form();
  form.append('f', 'json');
  form.append('attachment', rs);
};
var updateEmailSent = function (url, objectid) {
  request.post(url, {form: {f: 'json', features: JSON.stringify([{attributes: {OBJECTID: objectid, emailSent: 0}}])}},function (err, resp, body) {
  });
};
var sendEmail = function (file, email) {
  var transporter = mailer.createTransport(smtpTransport({
     host: 'cormailgw2.raleighnc.gov',
     port: 25
  }));
  fs.readFile(file, function (err, data) {
    transporter.sendMail({
        from: 'gis@raleighnc.gov',
        to: email,
        subject: 'Due Diligence',
        text: 'The attached PDF details your recently submitted due diligence request.',
        attachments: [{'filename': file, 'path': './' + file, contentType: 'application/pdf'}]
    });
  });
};
var buildPlanningTable = function (atts) {
  var table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
  table.table.body.push([{text: "What are the zoning codes for this site?", style: "question"}, {text: atts.planning1 ? atts.planning1 : ""}]);
  table.table.body.push([{text: "Are there zoning conditions?", style: "question"}, {text: atts.planning2 ? atts.planning2 : ""}]);
  table.table.body.push([{text: "Are there zoning overlays?", style: "question"}, {text: atts.planning3 ? atts.planning3 : ""}]);
  if (atts.planning1 && atts.planning1 != "N/A") {
    table.table.body.push([{text: "What is the frontage?", style: "question"}, {text: [{text: atts.planning4 ? atts.planning4 : ""}, {text: "Link", link: "https://www.raleighnc.gov/content/extra/Books/PlanDev/UnifiedDevelopmentOrdinance/#70", decoration:"underline", color: "blue", style: "link"}]}]);
  } else {
    table.table.body.push([{text: "What is the frontage?", style: "question"}, {text: atts.planning4 ? atts.planning4 : ""}]);
  }
  table.table.body.push([{text: "Max building height (stories)", style: "question"}, {text: atts.planning5 ? atts.planning5 : ""}]);
  table.table.body.push([{text: "Max density (units/acres)", style: "question"}, {text: atts.planning6 ? atts.planning6 : ""}]);
  table.table.body.push([{text: "Allowable Building Types", style: "question"}, {text: atts.planning7 ? atts.planning7 : ""}]);
  table.table.body.push([{text: "Additional Comments", style: "question"}, {text: atts.planning8 ? atts.planning8 : ""}]);
  return table;
};
var buildForestryTable = function (atts) {
  table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
  table.table.body.push([{text: "Is the property in question 2 acres or greater?", style: "question"}, {text: atts.forestry1}]);
  if (atts.forestry1 === "Yes") {
  table.table.body.push([{text: "How much tree conservation is required based on the parcels zoning?", style: "question"}, {text: atts.forestry2 ? atts.forestry2 : ""}]);
    table.table.body.push([{text: "Is there existing tree conservation on the property?", style: "question"}, {text: atts.forestry3 ? atts.forestry3 : ""}]);
  }
  table.table.body.push([{text: "What areas would be considered for tree conservation?", style: "question"}, {text: atts.forestry4 ? atts.forestry4 : ""}]);
  table.table.body.push([{text: "Is the project located in a watershed protection overlay district (Urban, Falls,Swift Creek)?", style: "question"}, {text: atts.forestry5 ? atts.forestry5 : ""}]);
  table.table.body.push([{text: "Will street trees be required as part of the development of the parcels?", style: "question"}, {text: atts.forestry6 ? atts.forestry6 : ""}]);
  table.table.body.push([{text: "Additional Comments", style: "question"}, {text: atts.forestry6 ? atts.forestry6 : ""}]);
  return table;
};
var buildUtilitiesTable = function (atts) {
  var table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
  table.table.body.push([{text: "Will I be required to extend water along any public rights of way?", style: "question"}, {text: atts.utilities1 ? atts.utilities1 : ""}]);
  table.table.body.push([{text: "Will I be required to extend sewer to any adjacent upstream properties?", style: "question"}, {text: atts.utilities2 ? atts.utilities2 : ""}]);
  table.table.body.push([{text: "Are there any water pressure or sewer capacity concerns?", style: "question"}, {text: atts.utilities3 ? atts.utilities3 : ""}]);
  table.table.body.push([{text: "Will an off-site sanitary sewer easement be required?", style: "question"}, {text: atts.utilities4 ? atts.utilities4 : ""}]);
  table.table.body.push([{text: "Is there a pending water and/or sewer assessment on my property?", style: "question"}, {text: atts.utilities5 ? atts.utilities5 : ""}]);
  table.table.body.push([{text: "Additional Comments", style: "question"}, {text: atts.utilities6 ? atts.utilities6 : ""}]);
  return table;
};
var buildStormwaterTable = function (atts) {
  var table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
  table.table.body.push([{text: "Stormwater Contact", style: "question"}, {text: atts.storm4 ? atts.storm4 : ""}]);
  table.table.body.push([{text: "Is the property located within a sensitive watershed?", style: "question"}, {text: atts.storm5a ? atts.storm5a : ""}]);
  if (atts.storm5a === "Yes") {
    table.table.body.push([{text: "Which sensitive watershed is the property located?", style: "question"}, {text: atts.storm5b ? atts.storm5b : ""}]);
  }
  table.table.body.push([{text: "Are there possible Neuse Riparian Buffers onsite?", style: "question"}, {text: atts.storm6 ? atts.storm6 : ""}]);
  table.table.body.push([{text: "Are there floodprone areas on the property?", style: "question"}, {text: atts.storm7a ? atts.storm7a : ""}]);
  if (atts.storm7a === "Yes") {
    table.table.body.push([{text: "Which floodprone areas are on the property?", style: "question"}, {text: atts.storm7b ? atts.storm7b : ""}]);
    if (atts.storm7b === "Other") {
      table.table.body.push([{text: "If other, then", style: "question"}, {text: atts.storm7c ? atts.storm7c : ""}]);
    }
  }
  table.table.body.push([{text: "Existing Stormwater Control Measures (SCMs)?", style: "question"}, {text: atts.storm8 ? atts.storm8 : ""}]);
  table.table.body.push([{text: "Drainage Easements?", style: "question"}, {text: atts.storm9 ? atts.storm9 : ""}]);
  table.table.body.push([{text: "Possible Exemptions from UDO Section 9.2.2?", style: "question"}, {text: atts.storm10a ? atts.storm10a : ""}]);
  if (atts.storm10a === "Yes") {
    table.table.body.push([{text: "If yes, then", style: "question"}, {text: atts.storm10b ? atts.storm10b : ""}]);
  }
  table.table.body.push([{text: "Impervious Limitation for Exemption (based on zoning)?", style: "question"}, {text: atts.storm11 ? atts.storm11 : ""}]);
  table.table.body.push([{text: "Other requirements", style: "question"}, {text: atts.storm12 ? atts.storm12 : ""}]);
  table.table.body.push([{text: "Sureties?", style: "question"}, {text: atts.storm13 ? atts.storm13 : ""}]);
  table.table.body.push([{text: "Additional Comments", style: "question"}, {text: atts.storm14 ? atts.storm14 : ""}]);
  return table;
};

var buildFrontagesTable = function (atts) {
  var table = {style: 'tableExample', table: {widths: [ '*', '*', '*'], headerRows: 1, body:[[{text: 'Street Name', style: 'tableHeader'}, {text: 'Cross Section', style: 'tableHeader'}, {text: 'Maintenance Responsibilities', style: 'tableHeader'}]]}};
  if (atts.trans2_1a && atts.trans2_1b && atts.trans2_1c) {
    table.table.body.push([{text: atts.trans2_1a ? atts.trans2_1a : "", style: "question"}, {text: atts.trans2_1b ? atts.trans2_1b : ""}, {text: atts.trans2_1c ? atts.trans2_1c : ""}]);
  }
  if (atts.trans2_2a && atts.trans2_2b && atts.trans2_2c) {
    table.table.body.push([{text: atts.trans2_2a ? atts.trans2_2a : "", style: "question"}, {text: atts.trans2_2b ? atts.trans2_2b : ""}, {text: atts.trans2_2c ? atts.trans2_2c : ""}]);
  }
  if (atts.trans2_3a && atts.trans2_3b && atts.trans2_3c) {
    table.table.body.push([{text: atts.trans2_3a ? atts.trans2_3a : "", style: "question"}, {text: atts.trans2_3b ? atts.trans2_3b : ""}, {text: atts.trans2_3c ? atts.trans2_3c : ""}]);
  }
  if (atts.trans2_4a && atts.trans2_4b && atts.trans2_4c) {
    table.table.body.push([{text: atts.trans2_4a ? atts.trans2_4a : "", style: "question"}, {text: atts.trans2_4b ? atts.trans2_4b : ""}, {text: atts.trans2_4c ? atts.trans2_4c : ""}]);
  }
  return table;
};
var buildTransportationTable = function (atts) {
  var table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
  table.table.body.push([{text: "Are there proposed streets that impact this site?", style: "question"}, {text: atts.trans3a ? atts.trans3a : ""}]);
  if (atts.trans3a === "Yes") {
    table.table.body.push([{text: "Description", style: "question"}, {text: atts.trans3b ? atts.trans3b : ""}]);
  }
  table.table.body.push([{text: "What is the applicable block perimeter?", style: "question"}, {text: atts.trans4 ? atts.trans4 : ""}]);
  table.table.body.push([{text: "Is there an adopted streetscape plan?", style: "question"}, {text:atts.trans5a ? atts.trans5a : ""}]);
  if (atts.trans5a === "Yes") {
    table.table.body.push([{text: "What is the adopted streetscape plan name?", style: "question"}, {text: atts.trans5b ? atts.trans5b : ""}]);
  }
  table.table.body.push([{text: "Additional Transportation Comments", style: "question"}, {text: atts.trans6 ? atts.trans6 : ""}]);
  return table;
};
var buildPdf = function (dd, oid, email) {
  console.log(dd);
  var pdfDoc = printer.createPdfKitDocument(dd);
  pdfDoc.pipe(fs.createWriteStream(oid + '.pdf')).on('finish',function(){
    var file = oid + '.pdf';
    var url ='https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/' + oid + '/addAttachment';
    sendAttachment(url, file);
    url = "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/updateFeatures";
    updateEmailSent(url, oid);
    sendEmail(file, email);
  });
  pdfDoc.end();
};
var getDocBase = function () {
  var dd = {
  content: [],
  styles: {
    header: {
      fontSize: 22,
      bold: true,
      margin: [0, 10, 0, 10]
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 10]
    },
    question: {
      italics: true,
      bold: true
    },
    tableExample: {
      margin: [0, 5, 0, 15]
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: 'black'
    },
    link: {
      margin: [15, 0, 0, 0]
    }
  }
  };
  return dd;
};
var getDomainValues = function (fields, feature) {
  fields.forEach(function (field) {
    if (field.domain) {
      var filtered = field.domain.codedValues.filter(function (item) {
        return item.code === feature.attributes[field.name];
      });
      if (filtered.length > 0) {
        feature.attributes[field.name] = filtered[0].name;
      }
    }
  });
  return feature;
};
var handleFeature = function (feature) {
  var dd = getDocBase();
  console.log(feature);
  feature = getDomainValues(data.fields, feature)
  dd.content.push({text: "Information", style: "header"});
  var table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
  table.table.body.push([{text: "Prepared For"}, {text: feature.attributes.contact}]);
  table.table.body.push([{text: "Project Name"}, {text: feature.attributes.project}]);
  table.table.body.push([{text: "Addresses Selected"}, {text: feature.attributes.address.replace(/,/g, ', ')}]);
  table.table.body.push([{text: "PIN #s Selected"}, {text: feature.attributes.pins.replace(/,/g, ', ')}]);
  dd.content.push(table);
  dd.content.push({text: " "});
  dd.content.push({text: "Planning", style: "header"});
  dd.content.push(buildPlanningTable(feature.attributes));
  dd.content.push({text: "Urban Forestry", style: "header"});
  dd.content.push(buildForestryTable(feature.attributes));
  dd.content.push({text: "Public Utilities", style: "header"});
  dd.content.push(buildUtilitiesTable(feature.attributes));
  dd.content.push({text: "Stormwater", style: "header"});
  dd.content.push(buildStormwaterTable(feature.attributes));
  dd.content.push({text: "Transportation", style: "header"});
  var table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
  table.table.body.push([{text: "Is a traffic study/analysis required?", style: "question"}, {text: feature.attributes.trans1 ? feature.attributes.trans1 : ""}]);
  dd.content.push(table);
  dd.content.push({text: "Street Frontages", style: "subheader"});
  dd.content.push(buildFrontagesTable(feature.attributes));
  dd.content.push(buildTransportationTable(feature.attributes));
  buildPdf(dd, feature.attributes.OBJECTID, feature.attributes.email);
};
var retreivedFeatures = function (error, response, body) {
  data = body;
  data = JSON.parse(data);
  console.log(data.features.length);
  data.features.forEach(handleFeature);
};
request.post("http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/query", {form: {f: 'json', outFields: '*', where: 'Status = 1 and emailSent = 0', returnGeometry: 'false'}}, retreivedFeatures);
