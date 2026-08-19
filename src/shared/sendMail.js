const nodeMail = require("nodemailer");



// const transporter = nodeMail.createTransport({
//     //  host: 'smtp.ethereal.email',
//     //  port: 587,
     
//        host: 'smtp.hostinger.com',
//        port: 465, // SSL port
//       secure: true, // Use true for SSL
//       auth: {
//             //  user: 'tristian.hickle9@ethereal.email',
//             //  pass: 'Wz1M1qjnNGGASAQzKj'
  
//             user: 'support@sageafrica.ng',
//             pass: 'rt>JhLX4|'
        
//       }
//     });
const transporter = nodeMail.createTransport({
  //  host: 'smtp.ethereal.email',
  //  port: 587,
   
     host: 'smtp.hostinger.com',
     port: 465, // SSL port
     secure: true, // Use true for SSL
    auth: {
          //  user: 'tristian.hickle9@ethereal.email',
          //  pass: 'Wz1M1qjnNGGASAQzKj'

          user: 'info@greenheyscredit.com',
          pass: 'b1AYF1v@B'
      
    }
  });


const getSendMail = async (bodyMsg,mailto,subj,name)=>{

    let htmlContent = ``;
        htmlContent +=`
                    <!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <title>info@greenheycredit.net Email</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <style type="text/css">
    #outlook a { padding: 0; }
    .ReadMsgBody, .ExternalClass { width: 100%; }
    .ExternalClass * { line-height: 100%; }
    body {
      margin: 0; padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0; height: auto;
      line-height: 100%;
      outline: none; text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    p { display: block; margin: 13px 0; }
  </style>

  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport { width: 320px; }
      @viewport { width: 320px; }
    }
  </style>
  <!--<![endif]-->

  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
        rel="stylesheet" type="text/css">

  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Roboto:300,400,500,700);
    @media only screen and (min-width:480px) {
      .mj-column-per-100 { width: 100% !important; max-width: 100%; }
      .mj-column-per-50 { width: 50% !important; max-width: 50%; }
    }
    @media only screen and (max-width:480px) {
      table.full-width-mobile { width: 100% !important; }
      td.full-width-mobile { width: auto !important; }
    }
  </style>
</head>

<body style="background-color:#EDF2F9;">
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    info@greenheycredit Email
  </div>

  <div style="background-color:#EDF2F9;">

    <!-- Header -->
    <div style="background:#284d38;Margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background: #14441e;width:100%;">
        <tr>
          <td style="text-align:center;padding:20px 0;">
            <div style="display:inline-block;width:100%;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding:10px 25px;">
                    <div style="font-family:'Roboto Condensed', Helvetica, Arial, sans-serif;font-size:26px;font-weight:400;line-height:24px;text-align:center;color:#ffffff;">
                      <div style="display:block;margin:auto;">
                        <img src="https://greenheyscredit.com/assets/images/logo.png" height="30" width="30" style="border-radius:3px; margin:3px; width:60px; height:50px" />
                      </div>
                      <b style="margin-top:30px">Green Hey Credit</b>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body Section -->
    <div style="box-shadow: 0 25px 50px rgba(8,21,66,.06); Margin: 0px auto; max-width: 600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <div style="background:#ffffff;max-width:600px;Margin:0px auto;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background:#ffffff;">
                <tr>
                  <td style="padding:15px;">
                    <div style="display:inline-block;width:100%;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border:1px solid #dddddd;">
                        <tr>
                          <td style="padding:0 20px;">
                            <p style="border-top:dashed 1px lightgrey;margin:0px auto;width:100%;"></p>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding:20px;">
                            <div style="font-family:'Roboto Condensed', sans-serif;font-size:16px;line-height:24px;color:#000000;text-align:left;">
                                  ${bodyMsg} <!-- Replace with actual message -->
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 25px;"></td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="background:#ffffff;Margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
        <tr>
          <td style="padding:0 15px;text-align:center;">
            <div style="display:inline-block;width:100%;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td align="left" style="padding:10px 25px;">
                    <div style="font-family:Helvetica, Arial, sans-serif;font-size:14px;line-height:24px;color:#637381;">
                      If you need support, contact: info@greenheycredit.com
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding:10px 25px;padding-bottom:0;">
                    <div style="font-family:Helvetica, Arial, sans-serif;font-size:14px;line-height:24px;color:#637381;">
                      <strong>greenheycredit Team</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding:10px 25px;">
                    <div style="font-family:Helvetica, Arial, sans-serif;font-size:14px;line-height:24px;color:#637381;">
                      Replies to this message are undeliverable and will not reach the <strong>greenheycredit Team</strong>. Please do not reply.
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Social Icons and Copyright -->
    <div style="Margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="text-align:center;padding:20px 0;">
            <div style="display:inline-block;width:100%;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;"> 
                    <!-- Facebook -->
                    <a href="https://web.facebook.com/greenheycredit?_rdc=1&_rdr" target="_blank">
                      <img src="https://www.mailjet.com/images/theme/v1/icons/ico-social/facebook.png" width="30" height="30" style="border-radius:3px; background:#284d38;" />
                    </a>
                    <!-- Instagram -->
                    <a href="https://www.instagram.com/greenheycreditpro/" target="_blank">
                      <img src="https://www.mailjet.com/images/theme/v1/icons/ico-social/instagram.png" width="30" height="30" style="border-radius:3px; background:#284d38;" />
                    </a>
                    <!-- Twitter -->
                    <a href="https://twitter.com/greenheycredit" target="_blank">
                      <img src="https://www.mailjet.com/images/theme/v1/icons/ico-social/twitter.png" width="30" height="30" style="border-radius:3px; background:#284d38;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:10px 25px;">
                    <div style="font-family:Helvetica, Arial, sans-serif;font-size:11px;line-height:16px;color:#445566;">
                      Copyright greenheycredit Limited - All Rights Reserved.
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>

  </div>
</body>
</html> `;
             
  
            
   // const info = await transporter.sendMail({
     transporter.sendMail({
       // from: '"greenheycredit Limited" <info@greenheyscredit.com>', // sender address
        from: '"greenheyscredit Limited" <info@greenheyscredit.com>', // sender address
        to: mailto, // list of receivers
        subject: subj, // Subject line
        // text: "Hello world?", // plain text body
        html:  htmlContent, // html body
      //    attachments: [
      //   {
      //     filename: 'output.pdf',
      //     path: pdfPath,
      //   },
      // ],
    },(error, info) => {
      if (error) {
        console.error('Error occurred:', error.message);
      } else {
        console.log('Email sent:', info.response);
        return info.messageId;
      }
    });

  //console.log("Message sent: %s", info.messageId);
    //console.log(year+"-"+month+"-"+day);
   // return info.messageId;

}

module.exports ={
    getSendMail
}