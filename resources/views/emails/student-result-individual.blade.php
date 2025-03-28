<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your BCI Campus Result</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background-color: #1E3A8A;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>BCI Campus Result</h1>
        <p>"Aspire to Inspire"</p>
    </div>
    
    <div class="content">
        <p>Dear {{ $student->first_name }},</p>
        
        <p>Please find your results for <strong>{{ $batchName }}</strong> below:</p>
        
        <table>
            <tr>
                <th>Student Name</th>
                <td>{{ $student->first_name }}</td>
            </tr>
            <tr>
                <th>NIC/Passport</th>
                <td>{{ $student->NIC_PO }}</td>
            </tr>
            <tr>
                <th>Status</th>
                <td>{{ $status }}</td>
            </tr>
        </table>
        
        <h3>Subject Results</h3>
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Grade</th>
                </tr>
            </thead>
            <tbody>
                @foreach($subjects as $subject)
                    @if($subject->grade && $subject->grade !== '-')
                    <tr>
                        <td>{{ $subject->subject_name }}</td>
                        <td>{{ $subject->grade }}</td>
                    </tr>
                    @endif
                @endforeach
            </tbody>
        </table>
        
        <p>Congratulations on your achievements!</p>
        
        <p>Best regards,<br>BCI Campus</p>
    </div>
    
    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>© {{ date('Y') }} BCI Campus. All rights reserved.</p>
    </div>
</body>
</html>