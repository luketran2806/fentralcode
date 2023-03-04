<?php
session_start();
include($_SERVER["DOCUMENT_ROOT"] ."/FENTRAL_SIMPLE/components/navbar.php");
include($_SERVER["DOCUMENT_ROOT"] ."/FENTRAL_CLEAN_V1/db_config/config.php");
?>

<html land="en">
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" href="/FENTRAL_SIMPLE/css/discount_clothing_css.css">
<title>DISCOUNTS | FENTRAL </title>
<style>
  .zoom_slidecontainer {
    width: 100px;
    position: sticky;
    z-index: 100;
    top: 20px;
    float: right;
    right: 20px;
}

.zoom_slidecontainer_fix{
  position: absolute;
    background: white;
    padding: 6px;
    outline: 1px solid black;
    border-radius: 8px;
    top:10px;
}

.zoom_slider {
  -webkit-appearance: none;
    width: 100%;
    height: 4.5px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
}

.zoom_slider:hover {
  opacity: 1;
}

.zoom_slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #0d6efd;
  cursor: pointer;
}

.zoom_slider::-moz-range-thumb {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #0d6efd;
  cursor: pointer;
}
#filter_panel_button_container{
    position: sticky;
    z-index: 100;
    top: 20px;
    float: right;
}
#filter_panel_button{
  position: absolute;
    right: 19px;
    top: 36px;
}
</style>
<body>
      <div class="sticky_filter" id="filter_panel">
        <div class="filter_container">
        <span class="filter_container_close" style="cursor:pointer">&times;</span>
          <ul class="slide">
            <div class="filters">
            <input class="form-control mr-sm-2" style="width:100%; border-radius:0px; " type="text" name="keywords" placeholder="Enter your search keywords" />
             

              <button class="classification accordion" id="brandpanel">Brand</button>
              <div class="panel">
                <?php
                $result_brand = mysqli_query(
                  $deals_link,
                  "SELECT DISTINCT(Brand) FROM mastersheet"
                );
                echo "<p style='margin-left:15px; text-align:center; font-size:11px; height: 5px;'>scroll down to see more </p>";
                while ($row_brand = mysqli_fetch_array($result_brand)) {
                  echo "<label class='container'><input type='checkbox' name='brand' value='" . $row_brand["Brand"] . "'' id='".$row_brand["Brand"]."'>" . $row_brand["Brand"] . "<span class='checkmark'></span></label>";
                }

                ?>
              </div>
              
              <button class="classification accordion" id="pricepanel">Price</button>
              <div class="panel">
              <label class="container"><input name="price" value="0-29" type="checkbox" id="0_30"> &lt;$30<span class="checkmark"></span></label>
                <label class="container"><input name="price" value="30-50" type="checkbox" id="30_50"> $30 - $50<span class="checkmark"></span></label>
                <label class="container"><input name="price" value="51-100" type="checkbox" id="50_100">$50 - $100<span class="checkmark"></span></label>
                <label class="container"><input name="price" value="101-200" type="checkbox" id="100_200">$100 - $200<span class="checkmark"></span></label>
                <label class="container"><input name="price" value="201-300" type="checkbox" id="200_300">$200 - $300<span class="checkmark"></span></label>
                <label class="container"><input name="price" value="300-1000" type="checkbox" id="300_"> &gt;$300<span class="checkmark"></span></label>
              </div>
              
              <button class="classification accordion" id="stylepanel">Style</button>
              <div class="panel">
                <label class="container"><input type="checkbox" name="style" value="General" id="generalwear">General<span class="checkmark"></span></label>
                <label class="container"><input type="checkbox" name="style" value="Streetwear" id="streetwear">Streetwear<span class="checkmark"></span></label>
                <label class="container"><input type="checkbox" name="style" value="Casualwear" id="casualwear">Casualwear<span class="checkmark"></span></label>
                <label class="container"><input type="checkbox" name="style" value="Activewear" id="activewear">Active/Sportswear<span class="checkmark"></span></label>
                <label class="container"><input type="checkbox" name="style" value="Formalwear" id="formalwear">Formal/Workwear<span class="checkmark"></span></label>
                <label class="container"><input type="checkbox" name="style" value="Luxurywear" id="luxurywear">Luxurywear<span class="checkmark"></span></label>
                <label class="container"><input type="checkbox" name="style" value="Other" id="other" >Other<span class="checkmark"></span></label>
              </div>
              
              


              <button class="classification accordion" id="categorypanel">Category</button>
              <div class="panel">
              <?php
                $result_categories = mysqli_query(
                  $deals_link,
                  "SELECT DISTINCT(categories) FROM mastersheet"
                );
                echo "<p style='margin-left:15px; text-align:center; font-size:11px; height: 5px;'>scroll down to see more </p>";
                while ($row_categories = mysqli_fetch_array($result_categories)) {
                  echo "<label class='container'><input type='checkbox' name='categories' value='" . $row_categories["categories"] . "'' id='".$row_categories["categories"]."'>" . $row_categories["categories"] . "<span class='checkmark'></span></label>";
                }
                mysqli_close($deals_link);
                ?>
              </div>

          </ul>
        </div>
      </div>
      <section>
 

      <nav id="filter_panel_button_container"><button id="filter_panel_button"> filters </button></nav>

      <ul id="ajax_content" class="product_table">
              </ul>



      <ul class="pagination" id="pg" >

      </ul>
              </section>
              <section id="commentsection">
        <span class="commentsection-close-btn">&times;</span>
          <div class="comment"> </div>
            <div class="commenting"> </div>
          
      </section>

<script src="/FENTRAL_SIMPLE/js/deals_clothing_js.js"></script>
<?php
 if(isset($_GET['checkbox'])){
  $str = ($_GET['checkbox']);
  $filter_category_link = explode('_',$str,2);
      echo '<script>
  $(document).ready(function() {
$("#'.$filter_category_link[1].'").prop("checked", true).change();
$("#'.$filter_category_link[0].'panel").click();
});
</script>';
 }
?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/masonry/4.2.1/masonry.pkgd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/3.1.8/imagesloaded.pkgd.min.js"></script>
<script>
  //init masonry grid 
$(window).on("load", function() {
	$(".product_table").masonry({
    itemSelector: ".list_style_product"
  });
});
</script>
  </body>
  </html>