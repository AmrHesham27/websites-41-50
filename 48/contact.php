<?php
declare(strict_types=1);

// -------------------- DB CONFIG --------------------
$dbHost = "127.0.0.1";
$dbName = "websites";
$dbUser = "root";
$dbPass = "";
$dbCharset = "utf8mb4";

// -------------------- Response helper --------------------
function respond(int $code, string $message): void {
  http_response_code($code);
  header("Content-Type: text/plain; charset=utf-8");
  echo $message;
  exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  respond(405, "Method not allowed.");
}

// -------------------- Read inputs --------------------
$name      = trim($_POST["name"] ?? "");
$email     = trim($_POST["email"] ?? "");
$siteTitle = trim($_POST["site_title"] ?? "");
$message   = trim($_POST["message"] ?? "");

// -------------------- Validate --------------------
if ($name === "" || $email === "" || $message === "") {
  respond(400, "All fields are required.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(400, "Invalid email.");
}

if ($siteTitle === "") {
  $siteTitle = "Unknown Site";
}

// length limits (match your table sizes)
if (mb_strlen($name) > 100)       respond(400, "Name too long.");
if (mb_strlen($email) > 190)     respond(400, "Email too long.");
if (mb_strlen($siteTitle) > 150) respond(400, "Site title too long.");
if (mb_strlen($message) > 5000)  respond(400, "Message too long.");

// optional metadata
$ip = $_SERVER["REMOTE_ADDR"] ?? null;
$ua = $_SERVER["HTTP_USER_AGENT"] ?? null;

// -------------------- Insert into DB --------------------
try {
  $dsn = "mysql:host={$dbHost};dbname={$dbName};charset={$dbCharset}";
  $pdo = new PDO($dsn, $dbUser, $dbPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);

  $sql = "INSERT INTO contact_messages
          (name, email, site_title, message, ip_address, user_agent)
          VALUES
          (:name, :email, :site_title, :message, :ip_address, :user_agent)";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ":name"       => $name,
    ":email"      => $email,
    ":site_title" => $siteTitle,
    ":message"    => $message,
    ":ip_address" => $ip,
    ":user_agent" => $ua,
  ]);

  respond(200, "Saved successfully.");
} catch (Throwable $e) {
  // in production: log $e->getMessage() to a file instead of showing it
  respond(500, "Server error. Could not save message.");
}