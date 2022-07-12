var customEmail = function (loginId, name, psw, state) {
    let title = "";
    let button = "";
  
    switch (state) {
      case "reset-psw":
        button = "";
        title = `Your password has been reset: <br> new tempory Password: ${psw}`;
        break;
      case "new-account":
        button = "";
        title = `Welcome to Wireless Fault Monitoring System! Please complete your registraion. <br> Using NIC and Email.`;
        break;
      case "e-verify":
        title = "Please verify your email";
        button =
          '<p><a href="http://localhost:8081/api/users/e-verify/' +
          loginId +
          '" class="btn btn-primary">Verify Email</a></p>';
        break;
      case "acc-activated":
        button = "";
        title = "Your Accout has been Activated!</br>Thank you!";
        break;
    }
  
    return `
      <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
  
      <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
  
      <style>
  
          html,
  body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background: #f1f1f1;
  }
  * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
  }
  div[style*="margin: 16px 0"] {
      margin: 0 !important;
  }
  table,
  td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
  }
  table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
  }
  img {
      -ms-interpolation-mode:bicubic;
  }
  
  a {
      text-decoration: none;
  }
  
  
  *[x-apple-data-detectors],  /* iOS */
  .unstyle-auto-detected-links *,
  .aBn {
      border-bottom: 0 !important;
      cursor: default !important;
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
  }
  
  .a6S {
      display: none !important;
      opacity: 0.01 !important;
  }
  
  .im {
      color: inherit !important;
  }
  
  img.g-img + div {
      display: none !important;
  }
  
  @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
      u ~ div .email-container {
          min-width: 320px !important;
      }
  }
  
  @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
      u ~ div .email-container {
          min-width: 375px !important;
      }
  }
  
  @media only screen and (min-device-width: 414px) {
      u ~ div .email-container {
          min-width: 414px !important;
      }
  }
  
      </style>
  
      <!-- CSS Reset : END -->
  
      <!-- Progressive Enhancements : BEGIN -->
      <style>
  
          .primary{
      background: #30e3ca;
  }
  .bg_white{
      background: #ffffff;
  }
  .bg_light{
      background: #fafafa;
  }
  .bg_black{
      background: #000000;
  }
  .bg_dark{
      background: rgba(0,0,0,.8);
  }
  .email-section{
      padding:2.5em;
  }
  
  .btn{
      padding: 10px 15px;
      display: inline-block;
  }
  .btn.btn-primary{
      border-radius: 5px;
      background: #30e3ca;
      color: #ffffff;
  }
  .btn.btn-white{
      border-radius: 5px;
      background: #ffffff;
      color: #000000;
  }
  .btn.btn-white-outline{
      border-radius: 5px;
      background: transparent;
      border: 1px solid #fff;
      color: #fff;
  }
  .btn.btn-black-outline{
      border-radius: 0px;
      background: transparent;
      border: 2px solid #000;
      color: #000;
      font-weight: 700;
  }
  
  h1,h2,h3,h4,h5,h6{
      font-family: 'Lato', sans-serif;
      color: #000000;
      margin-top: 0;
      font-weight: 400;
  }
  
  body{
      font-family: 'Lato', sans-serif;
      font-weight: 400;
      font-size: 15px;
      line-height: 1.8;
      color: rgba(0,0,0,.4);
  }
  
  a{
      color: #30e3ca;
  }
  
  table{
  }
  /*LOGO*/
  
  .logo h1{
      margin: 0;
  }
  .logo h1 a{
      color: #30e3ca;
      font-size: 24px;
      font-weight: 700;
      font-family: 'Lato', sans-serif;
  }
  
  /*HERO*/
  .hero{
      position: relative;
      z-index: 0;
  }
  
  .hero .text{
      color: rgba(0,0,0,.3);
  }
  .hero .text h2{
      color: #000;
      font-size: 40px;
      margin-bottom: 0;
      font-weight: 400;
      line-height: 1.4;
  }
  .hero .text h3{
      font-size: 24px;
      font-weight: 300;
  }
  .hero .text h2 span{
      font-weight: 600;
      color: #30e3ca;
  }
  
  
  /*HEADING SECTION*/
  .heading-section{
  }
  .heading-section h2{
      color: #000000;
      font-size: 28px;
      margin-top: 0;
      line-height: 1.4;
      font-weight: 400;
  }
  .heading-section .subheading{
      margin-bottom: 20px !important;
      display: inline-block;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(0,0,0,.4);
      position: relative;
  }
  .heading-section .subheading::after{
      position: absolute;
      left: 0;
      right: 0;
      bottom: -10px;
      content: '';
      width: 100%;
      height: 2px;
      background: #30e3ca;
      margin: 0 auto;
  }
  
  .heading-section-white{
      color: rgba(255,255,255,.8);
  }
  .heading-section-white h2{
      font-family: 
      line-height: 1;
      padding-bottom: 0;
  }
  .heading-section-white h2{
      color: #ffffff;
  }
  .heading-section-white .subheading{
      margin-bottom: 0;
      display: inline-block;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,.4);
  }
  
  
  ul.social{
      padding: 0;
  }
  ul.social li{
      display: inline-block;
      margin-right: 10px;
  }
  
  /*FOOTER*/
  
  .footer{
      border-top: 1px solid rgba(0,0,0,.05);
      color: rgba(0,0,0,.5);
  }
  .footer .heading{
      color: #000;
      font-size: 20px;
  }
  .footer ul{
      margin: 0;
      padding: 0;
  }
  .footer ul li{
      list-style: none;
      margin-bottom: 10px;
  }
  .footer ul li a{
      color: rgba(0,0,0,1);
  }
  
  
  @media screen and (max-width: 500px) {
  
  
  }
  
  
      </style>
  
  
  </head>
  
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
      <center style="width: 100%; background-color: #f1f1f1;">
      <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
      </div>
      <div style="max-width: 600px; margin: 0 auto;" class="email-container">
          <!-- BEGIN BODY -->
        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
            <tr>
            <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td class="logo" style="text-align: center;">
                          <h1><a href="#">Wireless Fault Monitoring System</a></h1>
                          <h2><a href="#">UGP - Faculty of Engineering</a></h2>
                          <h3><a href="#">University of Ruhuna</a></h3>
                        </td>
                    </tr>
                </table>
            </td>
            </tr><!-- end tr -->
            <tr>
            <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
              <img src="https://raw.githubusercontent.com/ColorlibHQ/email-templates/master/10/images/email.png" alt="" style="width: 100px; max-width: 100px; height: 100px; margin: auto; display: block;">
            </td>
            </tr><!-- end tr -->
                  <tr>
            <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
              <table>
                  <tr>
                      <td>
                          <div class="text" style="padding: 0 2.5em; text-align: center;">
                              <h2>Hi, ${name}</h2>
                              <h3>${title}</h3>            				
                              ${button}
                          </div>
                      </td>
                  </tr>
              </table>
            </td>
            </tr><!-- end tr -->
        <!-- 1 Column Text + Button : END -->
        </table>
        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
            <tr>
            <td valign="middle" class="bg_light footer email-section">
              <table>
                  <tr>
                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: left; padding-right: 10px;">
                            <h3 class="heading">About</h3>
                            <p>The Wireless Fault Monitoring System was introduced based on RFID Technology and Android Mobile Application Development.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: left; padding-left: 5px; padding-right: 5px;">
                            <h3 class="heading">Contact Info</h3>
                            <ul>
                              <li><span class="text">Undergraduate Project of Team InfinityDEV, Faculty of Engineering, University of Ruhuna, Galle, Sri Lanka</span></li>
                              <li><span class="text">+9411 269 6142</span></a></li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: left; padding-left: 10px;">
                            <h3 class="heading">Useful Links</h3>
                            <ul>
                                      <li><a href="#">Home</a></li>
                                      <li><a href="#">About</a></li>
                                      <li><a href="#">Services</a></li>
                                      <li><a href="#">Work</a></li>
                                    </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr><!-- end: tr -->
          <tr>
            <td class="bg_light" style="text-align: center;">
                <p>No longer want to receive these email? You can <a href="#" style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
            </td>
          </tr>
        </table>
  
      </div>
    </center>
  </body>
  </html>
      `;
  };
  
  module.exports = customEmail;
  