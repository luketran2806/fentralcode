<?php
session_start();
include($_SERVER["DOCUMENT_ROOT"] ."/FENTRAL_SIMPLE/components/navbar.php");
?>
<!DOCTYPE html>
<html>
<head>
  
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-144095863-3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-144095863-3');
</script>

  <meta charset="UTF-8">
  <meta name="description" content="Explore and discover stylish fashion brands at the online mall. All brands are ranked, rated and reviewed by the online mall">
  <meta name="keyword" content="streetwear, casualwear, luxurywear, activewear, generalwear, formalwear, workwear, the online mall, quality clothes, fashion information">
  <meta name="author" content="Triet Tran">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/FENTRAL_CLEAN_V1/css/frontpage_css.css">
<title> FENTRAL </title>

</head>

<body>
    <div style="width:100%;overflow-x:hidden">
  <?php
  include("loader.php");
 ?>
<script>
$(document).ready(function() {
  $('#overlay').fadeOut();
});
  </script>
  <section>
<div class="container-fluid">
        <div class="row">
    <section class="col-12 frontpage_main" style="height:700px;position:relative;">
    <h2 style="position:absolute; top:10px; left: 10px; color:white; background:black; padding:2px;"> Discover, style & save </h2>
    <div style="position:absolute; right:10px; top:10px; background:white; border:1px solid black; height:500px; width:400px;padding: 12px; box-sizing: border-box;">
    <h1 style="font-size:70px; color:black;"> FENTRAL </h1>
    <button class="button_frontpage question" id="question_1"><h3> Who are we? </h3></button>

    <button class="button_frontpage question_option_choose" id="style_activewear"><h3> Activewear </h3></button>
   
    <button class="button_frontpage question_option_choose" id="category_top"><h3> tops </h3></button>
   
    <button class="button_frontpage question_option_choose" id="price_51-100"><h3> $50-$100 </h3></button>
    <button class="button_frontpage question_option_choose" id="style_general"><h3> Generalwear</h3></button>
    <button class="button_frontpage question_option_choose" id="category_jeans"><h3> Jeans </h3></button>
    <button class="button_frontpage question_option_choose" id="price_0-29"><h3> $0-$30 </h3></button>    
    <button class="button_frontpage question_option_choose" id="brand_Theory"><h3> Theory </h3></button>    
    <button class="button_frontpage question" id="question_6"><h3> How does it work? </h3></button>
   
    <img src="/mascot2.png" style="
    height: 60px;
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;">
    </div>
    <h2 style="position:absolute; bottom:10px; right: 10px; color:white; background:black; padding:2px;"> browse deals without switching tabs!</h2>
    <article class="more_info_container" id="more_info_container_1">
    <span class="more_info_close" id="more_info_close">&times;</span>
    </article>

    <article class="more_info_container" id="more_info_container_2">
    <span class="more_info_close" id="more_info_close_2">&times;</span>
        <section id="more_info_container_inside" style="white-space: normal; overflow-x: hidden; height: 369px;overflow-y: hidden;">
        </section>
    </article>

    </section>
</section>

<script src="/FENTRAL_CLEAN_V1/js/frontpage_js.js"></script>
</body>
</html>
