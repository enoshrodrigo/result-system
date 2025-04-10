<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{!! $subject !!}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
        }
        .header {
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 20px;
            white-space: pre-line;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 10px;
            margin-top: 20px;
            font-size: 0.8em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Message from Administration</h2>
        </div>
        
        <div class="content">
            {!!$content !!}
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} Your Institution. All rights reserved.</p>
        @if(isset($trackingId))
        <img src="{{ route('track.email', $trackingId) }}" width="1" height="1" alt="" />
        @endif   </div><!-- At the end of your email template -->
     
    </div>
</body>
</html>