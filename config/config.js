let base_path = __dirname;
base_path= base_path.replace('config','');

module.exports = {

    /*
    |--------------------------------------------------------------------------
    | Database Connection
    |--------------------------------------------------------------------------
    | If you want create the diffrent connection then you will add the pakage name 
    | default db connection with the mysql . Mysql connection run on mysql2promise package.
    | You need add the package npm install --save mysql2
    | If you want to create connection with mongo db then u will create the connection with mongo db as well 
    | just change the database_connection to mongodb and package npm install mongodb --save
    | Support :- mysql , mongodb
    |
    */
   
    database_connection:'mysql',

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services your application utilizes. Set this in your ".index" file.
    |
    */

    env : 'dev',

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | Root Path of the application
    |
    */

    root_path :base_path ,

    /*
    |--------------------------------------------------------------------------
    | Application Email
    |--------------------------------------------------------------------------
    |
    | Config of the mail you can set the need to add the package nodemailer
    | url : https://nodemailer.com/about/
    |
    */

    mail_auth:{
      port: 587,
    secure: false, // true for 465, false for other ports
        service: 'gmail',
        auth: {
          user: 'noreply.bahamaeats@gmail.com',
          pass: '@@Bahamaeats123'
        }
      },

    /*
    |--------------------------------------------------------------------------
    | Application Port
    |--------------------------------------------------------------------------
    |
    | configration of application of the port
    |
    */   
     App_port:8008,

    /*
    |--------------------------------------------------------------------------
    | Twilio Credentials
    |--------------------------------------------------------------------------
    |
    | configration of application of the port
    |
    */   
     twilio:{
      accountSid:'AC721f4e767ac037c9eadcba972b16bb09',
      authToken: 'e81b8275ffb3687417718d7d2ef1d183'
     },
    
      /*
    |--------------------------------------------------------------------------
    | Application api End point
    |--------------------------------------------------------------------------
    |
    | configration of api end point. which access of the api url
    |
    */   
   API_ENDPOINT:'/api/v1/' 
}