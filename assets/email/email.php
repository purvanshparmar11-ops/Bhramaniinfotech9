<?php
/**
 * Bhramani Infotech - Email Submission Fallback Handler
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : (isset($_POST['fname']) ? trim($_POST['fname']) : '');
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if (empty($name)) {
        echo json_encode(['code' => 0, 'field' => 'name', 'err' => 'Name is required']);
        exit;
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['code' => 0, 'field' => 'email', 'err' => 'Valid email is required']);
        exit;
    }

    $to = "info@bhramaniinfotech.com";
    $subject = "New Inquiry from Bhramani Infotech Website: " . $name;
    $body = "Name: $name\nEmail: $email\nPhone: $phone\n\nMessage:\n$message\n";
    $headers = "From: webmaster@bhramaniinfotech.com\r\n" .
               "Reply-To: $email\r\n" .
               "X-Mailer: PHP/" . phpversion();

    @mail($to, $subject, $body, $headers);

    echo json_encode(['code' => 1, 'success' => 'Thank you! Your inquiry has been sent successfully.']);
    exit;
}

echo json_encode(['code' => 0, 'err' => 'Invalid request method.']);
