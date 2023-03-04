<?php
session_start();

include($_SERVER["DOCUMENT_ROOT"] ."/FENTRAL_CLEAN_V1/db_config/config.php");

header('Content-Type: application/json');
$ajax = $_REQUEST;
unset($ajax['current_page']);
extract($_REQUEST);


if (isset($_POST['current_page']) && $_POST['current_page'] != "") {
    $current_page = $_POST['current_page'];
} else {
    $current_page = 1;
}


$total_records_per_page = 100;


$offset = ($current_page - 1) * $total_records_per_page;
$previous_page = $current_page - 1;
$next_page = $current_page + 1;
$adjacents = "2";
$total_no_of_pages = '';


function sf($col, $ajax)
{

    if (!isset($ajax[$col])) {
        return ('(true)');
    }

    if ($col == 'keywords') {
        if ($ajax[$col][0] == ""){
            return ('(true)');
        }else{
            $sql = "( ";
            $sql .= "( Name LIKE '%{$ajax[$col][0]}%' ";
            $sql .= ")) ";
        }
    }


    if ($col == 'style') {
        $sql = "( ";
        if (count($ajax[$col]) > 1) {
            foreach ($ajax[$col] as $key => $value) {
                $sql .= " $col LIKE '%{$value}%'  OR";
            }
            $sql = rtrim($sql, "OR");
        } else {
            $sql .= " $col LIKE '%{$ajax[$col][0]}%' ";
        }
        $sql .= ") ";
    }

    if ($col == 'categories') {
        $sql = "( ";
        if (count($ajax[$col]) > 1) {
            foreach ($ajax[$col] as $key => $value) {
                $sql .= "$col = '$value' OR ";
            }
            $sql = rtrim($sql, "OR");
        } else {
            $sql .= "$col = '{$ajax[$col][0]}'";
        }
        $sql .= ") ";
    }
    

    if ($col == 'price') {
        $sql = "( ";
        if (count($ajax[$col]) > 1) {
            foreach ($ajax[$col] as $key => $value) {
                $p = explode('-', $value);
                $sql .= " ( replace(After_sale, '$', '')  >= {$p[0]} AND  replace(After_sale, '$', '')  <= {$p[1]} ) OR";
            }
            $sql = rtrim($sql, "OR");
        } else {
            $p = explode('-', $ajax['price'][0]);
            $sql .= " replace(After_sale, '$', '')  >= {$p[0]} AND  replace(After_sale, '$', '')  <= {$p[1]} ";
        }
        $sql .= ") ";
    }

    if ( $col == 'rating') {
        $sql = "( ";
        if (count($ajax[$col]) > 1) {
            foreach ($ajax[$col] as $key => $value) {
                $sql .= " rating LIKE '%{$value}%' OR";
            }
            $sql = rtrim($sql, "OR");
        } else {
            $sql .= " rating LIKE '%{$ajax[$col][0]}%' ";
        }
        $sql .= ") ";
    }
    
    if ($col == 'brand') {
    $sql = "( ";
    if (count($ajax[$col]) > 1) {
        foreach ($ajax[$col] as $key => $value) {
            $sql .= "$col = '$value' OR ";
        }
        $sql = rtrim($sql, "OR");
    } else {
        $sql .= "$col = '{$ajax[$col][0]}'";
    }
    $sql .= ") ";
}


    $sql = str_replace(' OR )',')',$sql);
    return $sql;
}
$keywords = sf('keywords', $ajax);
$brands = sf('brand', $ajax);
$Style = sf('style', $ajax);
$categories = sf('categories', $ajax);
$rating = sf('rating', $ajax);
$After_sale = sf('price', $ajax);


$sql = "SELECT Brand, URL, Name, Before_sale, After_sale, Size, Image, Style, categories, rating, like_count,exist,id,COUNT(id) as total FROM mastersheet LEFT JOIN view_log ON mastersheet.id = view_log.product_id WHERE $keywords AND $brands AND $After_sale AND $Style AND $rating AND $categories GROUP BY mastersheet.id ORDER BY `total` DESC,like_count DESC, id LIMIT $offset, $total_records_per_page";

$result = mysqli_query($deals_link, "SELECT Brand, URL, Name, Before_sale, After_sale, Size, Image, Style, categories, rating, like_count,exist,id,COUNT(id) as total FROM mastersheet LEFT JOIN view_log ON mastersheet.id = view_log.product_id WHERE $keywords AND $brands AND $After_sale AND $Style AND $rating AND $categories GROUP BY mastersheet.id ORDER BY `total` DESC,like_count DESC, id LIMIT $offset, $total_records_per_page");

$total  = mysqli_query($deals_link, "SELECT  COUNT(*) as total FROM `mastersheet` WHERE $keywords AND $brands AND $After_sale AND $Style AND $rating AND $categories ");

$total= $total->fetch_assoc();
$total = $total['total'];

$total_no_of_pages = ceil( $total / $total_records_per_page );

ob_start();


while ($row = mysqli_fetch_array($result)) {
    $likeClass="far";	
			if(isset($_COOKIE['like_'.$row['id']])){
				$likeClass="fas";
			}		

			$dislikeClass="far";	
			if(isset($_COOKIE['dislike_'.$row['id']])){
				$dislikeClass="fas";
			}
    $name_product = str_replace(" ", "_", $row['Name']);
    echo "<li class='list_style_product' id='product".$row['id']."' data-name=" . $name_product . " data-brand='".$row['Brand']."'>";
    if ($row['exist'] != "in_last_scrape"){
        echo "<span style='font-size:8px; position: absolute;right: 10;top: 2;text-align: center;background:red;border-radius: 50%;padding: 2px; width: 30px;height: 30px; '> <span style='position:relative; top:7px; color:white;'> New! </span> </span>";
    }
    echo " <button type='button' name='save_to_likes' id='save_to_likes' class='save_to_likes' data-product_id='".$row['id']."' data-product_name=" . $name_product . " data-product_price='".$row['After_sale']."' data-product_link='".$row['URL']."'  data-product_image='".$row['Image']."'><i class='fa fa-plus'></i><span class='tooltiptext'> save item! </span></button> ";
        echo " <button type='button' name='add_to_cart' id='add_to_cart' class='add_to_cart' data-product_id='".$row['id']."' data-product_name=" . $name_product . " data-product_price='".$row['After_sale']."' data-product_link='".$row['URL']."'  data-product_image='".$row['Image']."'><i class='fa fa-shopping-cart'></i><span class='tooltiptext'> add to cart! </span></button> ";
    echo "<div class='product_image_container'><img src =" . $row["Image"] . " class='deals_image' alt=" . $name_product . " onerror='imgError(this);' loading='lazy'></img></div>";
    echo "<div style='font-weight:300; font-size: 12px;' class='brand_title_style' >" . $row["Brand"] . "</div>";
    $total_count=mysqli_query($deals_link,"SELECT COUNT(*) FROM `comments` WHERE `postid` = 'product".$row['id']."' ");
	$total_count_result = mysqli_fetch_array($total_count);
    echo "<button style='' class='commenticon'><i class='fa fa-comments-o' style='font-size: 12px; font-weight: 400;'></i><span id='commentproduct".$row['id']."' >".$total_count_result[0]."</span></button>";
    echo "<div style=' font-weight:300' class='item' data-priceafter=" . $row["After_sale"] . " data-name=" . $name_product . " >
<a href=" . $row["URL"] . " target='_blank' class='deals_item view_item' data-product_id='".$row['id']."'>" . $row["Name"] . "
</a> 
</div>";
    echo "<button class='likeicon' onclick=\"setLikeDislike('like','".$row['id']."')\">";
    echo "<i class='".$likeClass." fa-heart favoriteheart' id='like_".$row['id']."'></i>";
    echo "<span class='like_button' id='like'>".$row['like_count']."</span>";
    echo "</button>";
    echo "<div class='sizes_available' style='font-size: 12px; font-weight:300; position:relative;'><span style='background-color:lightgrey;padding:2px 4px; border-radius:3px; margin:1px; '>";
    $size = $row["Size"];
    $array = explode(',', $size);
    foreach ($array as $value) {
        echo "<span style='  font-size:12px;'>" . $value . "</span>";
    }
    echo "</span> <span class='from_store_icon'> <i class='fas fa-store'></i> <span class='tooltiptext' style='font-size:10px'>".$row['Brand']." </span> </span> </div>";
    echo "<div class='prices_available'>". "<span style='padding-right:5px'><del>$". $row["Before_sale"]."</del></span>$" . $row["After_sale"] . "</div>";
    echo "<a href=".$row["URL"]." target='_blank' class='view_item' data-product_id='".$row['id']."' ><button class='buynow'> buy now! </button></a>";
    echo "</li>";
}
echo '<script>

function setLikeDislike(type,id){
    jQuery.ajax({
        url:"/FENTRAL_CLEAN_V1/fetch/setlikedislike.php",
        type:"post",
        data:"type="+type+"&id="+id,
        success:function(result){
            result=jQuery.parseJSON(result);
            if(result.opertion=="like"){
                jQuery("#like_"+id).removeClass("far");
                jQuery("#like_"+id).addClass("fas");
                jQuery("#dislike_"+id).addClass("far");
                jQuery("#dislike_"+id).removeClass("fas");
                alertify.notify("You\'ve liked a piece of clothing!", "success", 3);
            }
            if(result.opertion=="unlike"){
                jQuery("#like_"+id).addClass("far");
                jQuery("#like_"+id).removeClass("fas");
            }
            
            if(result.opertion=="dislike"){
                 jQuery("#dislike_"+id).removeClass("far");
                 jQuery("#dislike_"+id).addClass("fas");
                 jQuery("#like_"+id).addClass("far");
                 jQuery("#like_"+id).removeClass("fas");
            }
            if(result.opertion=="undislike"){
                jQuery("#dislike_"+id).addClass("far");
                jQuery("#dislike_"+id).removeClass("fas");
            }
            
            
            jQuery("#product"+id+" #like").html(result.like_count);
            jQuery("#product"+id+" #dislike").html(result.dislike_count);
        }
        
    });
}


$(".commenticon").click(function () {
    event.stopPropagation();
	var id =$(this).parents("li").attr("id");
	var name = $(this).parents("li").data("name");
    var brand_name = $(this).parents("li").data("brand");
		var node = document.createElement("P");
		node.textContent = id;
		$.ajax({
        type: "POST",
        url: "/FENTRAL_CLEAN_V1/fetch/fetch_deals_comments.php",
        data: { text1: name, text6:brand_name, text3: id },
        success: function(response) {
            $(".commenting").html(response);
        }
    });
    
  $("#commentsection").animate({
        width: "toggle"
    });
  });

  $("html").click(function() {
	if ($("#commentsection:hover").length > 0){
		$("#commentsection").show();
    }else
	{
     $("#commentsection").hide();
	}
   });
   $(".commentsection-close-btn").click(function () {
    event.stopPropagation();
	$("#commentsection").hide();
	});

</script>
<script>
function load_cart_data()
{
 $.ajax({
  url:"/FENTRAL/shoppingcartfeature/fetch_cart.php",
  method:"POST",
  success:function(data)
  {
   $(".carting").html(data);
   $("#cart_count_cover").load(location.href + " #cart_count");
  }
 });
}

$(".add_to_cart").on("click", function(event){
    event.stopPropagation();
    var product_id = [];
    var product_name = [];
    var product_price = [];
    var product_image = [];
    var product_link = [];
    var action = "add";
      product_id.push($(this).data("product_id"));
      product_name.push($(this).data("product_name"));
      product_price.push($(this).data("product_price"));
      product_image.push($(this).data("product_image"));
      product_link.push($(this).data("product_link"));
    if(product_id.length > 0)
    {
     $.ajax({
      url:"/FENTRAL/shoppingcartfeature/action.php",
      method:"POST",
      data:{product_id:product_id, product_name:product_name, product_price:product_price, product_image:product_image, product_link:product_link, action:action},
      success:function(data)
      {
        alertify.success("Successfully Added! ");
        load_cart_data();
        }
     });   
    }
   });

   $(".save_to_likes").on("click", function(event){
    event.stopPropagation();
    var product_id = [];
    var product_name = [];
    var product_price = [];
    var product_image = [];
    var product_link = [];
    var action = "add";
      product_id.push($(this).data("product_id"));
      product_name.push($(this).data("product_name"));
      product_price.push($(this).data("product_price"));
      product_image.push($(this).data("product_image"));
      product_link.push($(this).data("product_link"));
    if(product_id.length > 0)
    {
     $.ajax({
      url:"/FENTRAL/savetolikes/action.php",
      method:"POST",
      data:{product_id:product_id, product_name:product_name, product_price:product_price, product_image:product_image, product_link:product_link, action:action},
      success:function(data)
      {
        alertify.success("Successfully Saved! ");
        $("#save_count_cover").load(location.href + " #save_count");
        }
     });   
    }
   });

   $(".view_item").on("click", function(event){
    event.stopPropagation();
    var product_id = [];
    var action = "add";
      product_id.push($(this).data("product_id"));
    if(product_id.length > 0)
    {
     $.ajax({
      url:"/FENTRAL/viewlog/action.php",
      method:"POST",
      data:{product_id:product_id, action:action},
      success:function(data)
      {
        }
     });   
    }
   });

   
</script>



';
mysqli_close($con);


$html = ob_get_clean();
ob_end_clean();


echo json_encode([
    'html' => $html,
    'total_no_of_pages' => $total_no_of_pages
], JSON_UNESCAPED_SLASHES);
