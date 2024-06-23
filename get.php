<?php
try {
    // Connect to your database
    $pdo = new PDO('mysql:host=database-2.cf6qqccey9gx.eu-north-1.rds.amazonaws.com;dbname=branddb', 'admin', 'password');
    
    // Fetch the image data from the database
    $query = $pdo->prepare("SELECT image FROM color WHERE id = 2");
    $query->execute(); // Assuming you want to fetch the image for id 2
    $result = $query->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        // Retrieve the base64-encoded image data from the database
        $imageData = $result['image'];
        
        // Display the base64-encoded image in an HTML <img> tag
        echo '<img src="data:image/jpg;base64,' . $imageData . '" />';
    } else {
        echo "No image found for id 2.";
    }
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
