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


var transporter = mailer.createTransport(smtpTransport({
   host: 'cormailgw2.raleighnc.gov',
   port: 25
}));
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
request.post("http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/query", {form: {f: 'json', outFields: '*', where: 'Status = 1 and emailSent = 1', returnGeometry: 'false'}}, function (error, response, body) {
  data = body;
  data = JSON.parse(data);

  console.log(data.features.length);
  data.features.forEach(function (feature) {
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

    dd.content.push({text: "Information", style: "header"});

    var table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
    // doc.font('Helvetica-Bold').fontSize(16);
    table.table.body.push([{text: "Prepared For"}, {text: feature.attributes.contact}]);

    table.table.body.push([{text: "Project Name"}, {text: feature.attributes.project}]);
    table.table.body.push([{text: "Addresses Selected"}, {text: feature.attributes.address.replace(/,/g, ', ')}]);
    table.table.body.push([{text: "PIN #s Selected"}, {text: feature.attributes.pins.replace(/,/g, ', ')}]);
  //  dd.content.push({text: "raleighnc.gov", {link: 'https://www.raleighnc.gov', underline: true}});
    //dd.content.push({text:"RaleighNC.gov", link:"http://www.raleighnc.gov", decoration:"underline", fontSize:15});
    dd.content.push(table);
    dd.content.push({text: " "});
    dd.content.push({text: "Planning", style: "header"});
    table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
    table.table.body.push([{text: "What are the zoning codes for this site?", style: "question"}, {text: feature.attributes.planning1 ? feature.attributes.planning1 : ""}]);
    table.table.body.push([{text: "Are there zoning conditions?", style: "question"}, {text: feature.attributes.planning2 ? feature.attributes.planning2 : ""}]);
    table.table.body.push([{text: "Are there zoning overlays?", style: "question"}, {text: feature.attributes.planning3 ? feature.attributes.planning3 : ""}]);
    if (feature.attributes.planning1 && feature.attributes.planning1 != "N/A") {
      table.table.body.push([{text: "What is the frontage?", style: "question"}, {text: [{text: feature.attributes.planning4 ? feature.attributes.planning4 : ""}, {text: "Link", link: "https://www.raleighnc.gov/content/extra/Books/PlanDev/UnifiedDevelopmentOrdinance/#70", decoration:"underline", color: "blue", style: "link"}]}]);
    } else {
      table.table.body.push([{text: "What is the frontage?", style: "question"}, {text: feature.attributes.planning4 ? feature.attributes.planning4 : ""}]);
    }
    table.table.body.push([{text: "Max building height (stories)", style: "question"}, {text: feature.attributes.planning5 ? feature.attributes.planning5 : ""}]);
    table.table.body.push([{text: "Max density (units/acres)", style: "question"}, {text: feature.attributes.planning6 ? feature.attributes.planning6 : ""}]);
    table.table.body.push([{text: "Allowable Building Types", style: "question"}, {text: feature.attributes.planning7 ? feature.attributes.planning7 : ""}]);
    table.table.body.push([{text: "Additional Comments", style: "question"}, {text: feature.attributes.planning8 ? feature.attributes.planning8 : ""}]);
    dd.content.push(table);

    dd.content.push({text: "Urban Forestry", style: "header"});
    table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};

    table.table.body.push([{text: "Is the property in question 2 acres or greater?", style: "question"}, {text: feature.attributes.forestry1}]);
    if (feature.attributes.forestry1 === "Yes") {
    table.table.body.push([{text: "How much tree conservation is required based on the parcels zoning?", style: "question"}, {text: feature.attributes.forestry2 ? feature.attributes.forestry2 : ""}]);
      table.table.body.push([{text: "Is there existing tree conservation on the property?", style: "question"}, {text: feature.attributes.forestry3 ? feature.attributes.forestry3 : ""}]);
    }

    table.table.body.push([{text: "What areas would be considered for tree conservation?", style: "question"}, {text: feature.attributes.forestry4 ? feature.attributes.forestry4 : ""}]);
    table.table.body.push([{text: "Is the project located in a watershed protection overlay district (Urban, Falls,Swift Creek)?", style: "question"}, {text: feature.attributes.forestry5 ? feature.attributes.forestry5 : ""}]);
    table.table.body.push([{text: "Will street trees be required as part of the development of the parcels?", style: "question"}, {text: feature.attributes.forestry6 ? feature.attributes.forestry6 : ""}]);
    table.table.body.push([{text: "Additional Comments", style: "question"}, {text: feature.attributes.forestry6 ? feature.attributes.forestry6 : ""}]);
    dd.content.push(table);
    table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};

    dd.content.push({text: "Public Utilities", style: "header"});
    table.table.body.push([{text: "Will I be required to extend water along any public rights of way?", style: "question"}, {text: feature.attributes.utilities1 ? feature.attributes.utilities1 : ""}]);
    table.table.body.push([{text: "Will I be required to extend sewer to any adjacent upstream properties?", style: "question"}, {text: feature.attributes.utilities2 ? feature.attributes.utilities2 : ""}]);
    table.table.body.push([{text: "Are there any water pressure or sewer capacity concerns?", style: "question"}, {text: feature.attributes.utilities3 ? feature.attributes.utilities3 : ""}]);
    table.table.body.push([{text: "Will an off-site sanitary sewer easement be required?", style: "question"}, {text: feature.attributes.utilities4 ? feature.attributes.utilities4 : ""}]);
    table.table.body.push([{text: "Is there a pending water and/or sewer assessment on my property?", style: "question"}, {text: feature.attributes.utilities5 ? feature.attributes.utilities5 : ""}]);
    table.table.body.push([{text: "Additional Comments", style: "question"}, {text: feature.attributes.utilities6 ? feature.attributes.utilities6 : ""}]);
    dd.content.push(table);

    dd.content.push({text: "Stormwater", style: "header"});
    table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
    table.table.body.push([{text: "Stormwater Contact", style: "question"}, {text: feature.attributes.storm4 ? feature.attributes.storm4 : ""}]);
    table.table.body.push([{text: "Is the property located within a sensitive watershed?", style: "question"}, {text: feature.attributes.storm5a ? feature.attributes.storm5a : ""}]);
    if (feature.attributes.storm5a === "Yes") {
      table.table.body.push([{text: "Which sensitive watershed is the property located?", style: "question"}, {text: feature.attributes.storm5b ? feature.attributes.storm5b : ""}]);
    }
    table.table.body.push([{text: "Are there possible Neuse Riparian Buffers onsite?", style: "question"}, {text: feature.attributes.storm6 ? feature.attributes.storm6 : ""}]);
    table.table.body.push([{text: "Are there floodprone areas on the property?", style: "question"}, {text: feature.attributes.storm7a ? feature.attributes.storm7a : ""}]);
    if (feature.attributes.storm7a === "Yes") {
      table.table.body.push([{text: "Which floodprone areas are on the property?", style: "question"}, {text: feature.attributes.storm7b ? feature.attributes.storm7b : ""}]);
      if (feature.attributes.storm7b === "Other") {
        table.table.body.push([{text: "If other, then", style: "question"}, {text: feature.attributes.storm7c ? feature.attributes.storm7c : ""}]);
      }
    }
    table.table.body.push([{text: "Existing Stormwater Control Measures (SCMs)?", style: "question"}, {text: feature.attributes.storm8 ? feature.attributes.storm8 : ""}]);
    table.table.body.push([{text: "Drainage Easements?", style: "question"}, {text: feature.attributes.storm9 ? feature.attributes.storm9 : ""}]);
    table.table.body.push([{text: "Possible Exemptions from UDO Section 9.2.2?", style: "question"}, {text: feature.attributes.storm10a ? feature.attributes.storm10a : ""}]);
    if (feature.attributes.storm10a === "Yes") {
      table.table.body.push([{text: "If yes, then", style: "question"}, {text: feature.attributes.storm10b ? feature.attributes.storm10b : ""}]);
    }
    table.table.body.push([{text: "Impervious Limitation for Exemption (based on zoning)?", style: "question"}, {text: feature.attributes.storm11 ? feature.attributes.storm11 : ""}]);
    table.table.body.push([{text: "Other requirements", style: "question"}, {text: feature.attributes.storm12 ? feature.attributes.storm12 : ""}]);
    table.table.body.push([{text: "Sureties?", style: "question"}, {text: feature.attributes.storm13 ? feature.attributes.storm13 : ""}]);
    table.table.body.push([{text: "Additional Comments", style: "question"}, {text: feature.attributes.storm14 ? feature.attributes.storm14 : ""}]);

    dd.content.push(table);


    dd.content.push({text: "Transportation", style: "header"});
    table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
    table.table.body.push([{text: "Is a traffic study/analysis required?", style: "question"}, {text: feature.attributes.trans1 ? feature.attributes.trans1 : ""}]);
    dd.content.push(table);
    dd.content.push({text: "Street Frontages", style: "subheader"});
    table = {style: 'tableExample', table: {widths: [ '*', '*', '*'], headerRows: 1, body:[[{text: 'Street Name', style: 'tableHeader'}, {text: 'Cross Section', style: 'tableHeader'}, {text: 'Maintenance Responsibilities', style: 'tableHeader'}]]}};
    if (feature.attributes.trans2_1a && feature.attributes.trans2_1b && feature.attributes.trans2_1c) {
      table.table.body.push([{text: feature.attributes.trans2_1a ? feature.attributes.trans2_1a : "", style: "question"}, {text: feature.attributes.trans2_1b ? feature.attributes.trans2_1b : ""}, {text: feature.attributes.trans2_1c ? feature.attributes.trans2_1c : ""}]);
    }
    if (feature.attributes.trans2_2a && feature.attributes.trans2_2b && feature.attributes.trans2_2c) {
      table.table.body.push([{text: feature.attributes.trans2_2a ? feature.attributes.trans2_2a : "", style: "question"}, {text: feature.attributes.trans2_2b ? feature.attributes.trans2_2b : ""}, {text: feature.attributes.trans2_2c ? feature.attributes.trans2_2c : ""}]);
    }
    if (feature.attributes.trans2_3a && feature.attributes.trans2_3b && feature.attributes.trans2_3c) {
      table.table.body.push([{text: feature.attributes.trans2_3a ? feature.attributes.trans2_3a : "", style: "question"}, {text: feature.attributes.trans2_3b ? feature.attributes.trans2_3b : ""}, {text: feature.attributes.trans2_3c ? feature.attributes.trans2_3c : ""}]);
    }
    if (feature.attributes.trans2_4a && feature.attributes.trans2_4b && feature.attributes.trans2_4c) {
      table.table.body.push([{text: feature.attributes.trans2_4a ? feature.attributes.trans2_4a : "", style: "question"}, {text: feature.attributes.trans2_4b ? feature.attributes.trans2_4b : ""}, {text: feature.attributes.trans2_4c ? feature.attributes.trans2_4c : ""}]);
    }
    dd.content.push(table);
    table = {style: 'tableExample', table: {widths: [ '*', '*' ], body:[]}};
    table.table.body.push([{text: "Are there proposed streets that impact this site?", style: "question"}, {text: feature.attributes.trans3a ? feature.attributes.trans3a : ""}]);
    if (feature.attributes.trans3a === "Yes") {
      table.table.body.push([{text: "Description", style: "question"}, {text: feature.attributes.trans3b ? feature.attributes.trans3b : ""}]);
    }
    table.table.body.push([{text: "What is the applicable block perimeter?", style: "question"}, {text: feature.attributes.trans4 ? feature.attributes.trans4 : ""}]);
    table.table.body.push([{text: "Is there an adopted streetscape plan?", style: "question"}, {text:feature.attributes.trans5a ? feature.attributes.trans5a : ""}]);
    if (feature.attributes.trans5a === "Yes") {
      table.table.body.push([{text: "What is the adopted streetscape plan name?", style: "question"}, {text: feature.attributes.trans5b ? feature.attributes.trans5b : ""}]);
    }
    table.table.body.push([{text: "Additional Transportation Comments", style: "question"}, {text: feature.attributes.trans6 ? feature.attributes.trans6 : ""}]);
    dd.content.push(table);
    var pdfDoc = printer.createPdfKitDocument(dd);
    pdfDoc.pipe(fs.createWriteStream(feature.attributes.OBJECTID + '.pdf')).on('finish',function(){
      var file = feature.attributes.OBJECTID + '.pdf';
      var url ='https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/' + feature.attributes.OBJECTID + '/addAttachment';
      sendAttachment(url, file);
      url = "https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/updateFeatures";
      updateEmailSent(url, feature.attributes.OBJECTID);
      sendEmail(file, feature.attributes.email);
    });
    pdfDoc.end();
  });
});
