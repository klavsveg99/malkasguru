<?php
header('Content-Type: application/json');

require_once __DIR__ . '/vendor/autoload.php';

$cfg = require __DIR__ . '/../private/config.php';
$smtpHost = $cfg['smtpHost'];
$smtpUser = $cfg['smtpUser'];
$smtpPass = $cfg['smtpPass'];
$smtpPort = $cfg['smtpPort'];

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function sanitize($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$woodType = isset($_POST['woodType']) ? trim($_POST['woodType']) : '';
$amount = isset($_POST['amount']) ? trim($_POST['amount']) : '';
$location = isset($_POST['location']) ? trim($_POST['location']) : '';
$deliveryDate = isset($_POST['deliveryDate']) ? trim($_POST['deliveryDate']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

$messages = [
    'required' => 'Lūdzu, aizpildiet visus obligātos laukus.',
    'invalid_email' => 'Lūdzu, ievadiet derīgu e-pasta adresi.',
    'invalid_date' => 'Piegādes datumam jābūt vēlākam par šodienu.',
    'success' => 'Paldies! Jūsu pasūtījums ir saņemts. Mēs sazināsimies ar jums 24 stundu laikā.',
    'error' => 'Kļūda nosūtot ziņojumu. Lūdzu, mēģiniet vēlreiz.'
];

$t = $messages;

if (empty($name) || empty($email) || empty($phone) || empty($woodType) || empty($amount) || empty($location)) {
    echo json_encode(['success' => false, 'message' => $t['required']]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => $t['invalid_email']]);
    exit;
}

if (!empty($deliveryDate)) {
    $today = date('Y-m-d');
    if ($deliveryDate <= $today) {
        echo json_encode(['success' => false, 'message' => $t['invalid_date']]);
        exit;
    }
}

$to = 'info@malkasguru.lv';
$subject = 'Jauns pasūtījums no malkasguru.lv - ' . $name;

$email_content = "Jauns pasūtījums no malkasguru.lv:\n\n";
$email_content .= "Vārds: " . $name . "\n";
$email_content .= "E-pasts: " . $email . "\n";
$email_content .= "Tālrunis: " . $phone . "\n";
$email_content .= "Malkas veids: " . $woodType . "\n";
$email_content .= "Daudzums: " . $amount . "\n";
$email_content .= "Piegādes adrese: " . $location . "\n";
if (!empty($deliveryDate)) {
    $email_content .= "Vēlamais piegādes datums: " . $deliveryDate . "\n";
}
if (!empty($message)) {
    $email_content .= "Papildu informācija: " . $message . "\n";
}
$email_content .= "\n---\n";
$email_content .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = $smtpPort;

    $mail->setFrom($smtpUser, 'Malkas Guru');
    $mail->addAddress($to);
    $mail->addReplyTo($email, $name);

    $mail->Subject = $subject;
    $mail->Body = $email_content;
    $mail->CharSet = 'UTF-8';

    $mail->send();
    echo json_encode(['success' => true, 'message' => $t['success']]);
} catch (Exception $e) {
    error_log('PHPMailer Error: ' . $mail->ErrorInfo);
    echo json_encode(['success' => false, 'message' => $t['error']]);
}
