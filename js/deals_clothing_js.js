

$("#filter_panel_button").click( function() {
  $("#filter_panel").toggle();
})

var filter_container_close = document.getElementsByClassName("filter_container_close")[0];

filter_container_close.onclick = function() {
  $("#filter_panel").toggle();
}

$(document).mouseup(function (e) {
            var container = $("#filter_panel");
            if(!container.is(e.target) && 
            container.has(e.target).length === 0) {
                container.hide();
            }
        });

$(document).ready(function(){
  check_zoom_slider()
});

  //sidenav script
  function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }


  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }

  var dropdown = document.getElementsByClassName("dropdown-btn");
  var i;

  for (i = 0; i < dropdown.length; i++) {
    dropdown[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var dropdownContent = this.nextElementSibling;
      if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
      } else {
        dropdownContent.style.display = "block";
      }
    });
  }
  
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }

  var total_pages = 0;
  // remove images fast loading
  document.querySelectorAll('#ajax_content.img').forEach(function(e) {
    e.removeAttribute('src');
  })

  // ajax
  var ajax_param = {
    keywords: [],
    brand: [],
    price: [],
    style: [],
    rating: [],
    categories: [],
    current_page: 1,
  }

  $(document).ready(function() {
    fetch_results()
    $('input').each(function(index, element) {
      $(element).on('change', function(e) {
        ajax_param.current_page = 1;
        
              if (e.target.checked == true) {
                ajax_param[e.target.name].push(e.target.value);
              } else {
                if(e.target.type.toLowerCase() == 'text'){
                  ajax_param[e.target.name]=[];
                  ajax_param[e.target.name].push(e.target.value);
                }else{
                  ajax_param[e.target.name] = ajax_param[e.target.name].filter((i, v) => {
                  return i != e.target.value
                })
                }
              }
        fetch_results()
      });
    });



    function fetch_results() {
      $.ajax({
        type: "post",
        url: "/FENTRAL_CLEAN_V1/fetch/deals_fetch.php",
        data: ajax_param,
        dataType: 'type',
        beforeSend: function() {
          $('#spinner').show();
          $('#ajax_content').hide();
        },
        complete: function(response) {
          $('#ajax_content').show();
          $('#spinner').hide();
          var res = JSON.parse(response.responseText);
          $('#ajax_content').html(res.html);
          total_pages = res.total_no_of_pages;
          make_pagination(total_pages);
          var grid = document.querySelector('#ajax_content');
          //wait for images & links to load before applying masonry
          imagesLoaded(grid, function() {
            var masonry = new Masonry(grid, {
              itemSelector: '.list_style_product',
              columnWidth: '.list_style_product',
              percentPosition: true,
              transitionDuration: '0.5s'
            });
          });
          

        }
      });
    }


    function make_pagination(no_pages) {

      var current_page = ajax_param.current_page;

      var prev = +current_page - 1;
      var next = +current_page + 1;


      var prev_dis = '';
      if (prev <= 0) {
        prev_dis = 'disabled';
      }

      var html = `
        <li>
          <button value='${prev}' class="pg_link ${prev_dis}">←</button>
        </li>
       
       `;


      if (no_pages < 14) {
        for (var i = 1; i <= no_pages; i++) {
          var active = '';
          if (current_page == i) {
            active = 'active';
          }

          html += ` 
            <li>
            <button style='cursor:pointer' value='${i}' class="pg_link ${active}">${i}</button>
            </li>
            `;
        }
      } else {

        var page = [];
        // first 3 


        for (var i = 1; i <= 1; i++) {
          page[i] = 1;
          var active = '';
          if (current_page == i) {
            active = 'active';
          }
          html += ` 
            <li>
            <button style='cursor:pointer' value='${i}' class="pg_link ${active}">${i}</button>
            </li>
            `;
        }


        // middle 3 


        for (var i = +current_page - 3; i <= +current_page + 3; i++) {

          if (i <= 0 || i > total_pages) {
            continue;
          }
          if (page[i] == 1) {
            continue;
          }
          page[i] = 1;
          var active = '';
          if (current_page == i) {
            active = 'active';
          }
          html += ` 
            <li>
            <button style='cursor:pointer' value='${i}' class="pg_link ${active}">${i}</button>
            </li>
            `;
        }


        // last 3 
        for (var i = total_pages ; i <= total_pages; i++) {
          var active = '';
          if (current_page == i) {
            active = 'active';
          }
          if (page[i] == 1) {
            continue;
          }
          html += ` 
            <li>
            <button style='cursor:pointer' value='${i}' class="pg_link ${active}">${i}</button>
            </li>
            `;
        }

      }

      var next_dis = '';
      if (next > total_pages) {
        next_dis = 'disabled';
      }
      html += `  
      <li>
        <button value='${next}' class="pg_link ${next_dis}">→</button>
      </li>
     `;

      $('#pg').html(html);


      $('.pg_link').on('click', (e) => {
        var page_no = e.target.value;
        if (page_no <= total_pages && page_no >= 1) {
          ajax_param.current_page = e.target.value;
          fetch_results()
        }
      });

    }


  });

  
 