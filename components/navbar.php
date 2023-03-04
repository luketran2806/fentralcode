<?php
session_start();
include($_SERVER["DOCUMENT_ROOT"] ."/FENTRAL_CLEAN_V1/components/page_loader.php");
?>

    <script src='https://kit.fontawesome.com/a076d05399.js' crossorigin='anonymous'></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js"crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/alertify.min.js"></script>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/alertify.min.css"/>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/themes/default.min.css"/>
    <script src='https://code.jquery.com/jquery-2.2.4.min.js'></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <link rel="stylesheet" href="/FENTRAL_SIMPLE/css/navbar_css.css">
    

<nav class="navbar navbar-expand-lg" style="position:sticky; top:0; z-index:999;">
<div class="container-fluid">
          <h4> <a class="nav_link" href="/"> FENTRAL </a> </h4>
            <a style="margin-left:4px;" href="/womenswear" class="nav_link"> womenswear </a>
    <ul class="navbar-nav ms-auto navigation_bar_drop_down">
        <li class="nav-item" style="list-style-type:none;">
            <a class="nav-link nav_link" href="/login"><?php session_start();
                   if (isset($_SESSION['loggedin'])) 
                   {
                     echo "dashboard";
                   }
                   else{
                     echo "login";
                     }
                     ?></a>
        </li>

        <li style="list-style-type:none; padding:0px 15px; ">
        <a href="/saved_items" class="saveicon nav_link"><i class="fas fa-tshirt" style="line-height: 40px;"></i><span id="save_count_cover"><span id="save_count" style="font-size: 8px;margin-left:-4px;">
              <?php 
                  $con_connect = mysqli_connect('localhost', 'triettran', '', 'test');
                  $sql_count="SELECT COUNT(*) as total FROM favorite_outfits where `user_id` = '".$_SESSION['unique_id']."'";
                  $result_count=mysqli_query($con_connect,$sql_count);
                  if($result_count)
                  {
                  while($row=mysqli_fetch_assoc($result_count))
                    {
                          echo $row['total'];
                    }     
                  }
                ?>
              </span></span></a>   
    </li>
    </ul>
  </div>
</div>
</nav>
<section id="cartsection">
        <span class="cartsection-close-btn">&times;</span>
          <div class="cart"> </div>
            <div class="carting"> </div>
          
      </section>

      <script src="/FENTRAL_CLEAN_V1/js/navbar_js.js"></script>
      <script src="/FENTRAL_CLEAN_V1/js/page_loader_fadeout.js" defer></script>
