KROWN.themeName = "Kingdom";
KROWN.themeVersion = "5.0.0";

// Shopify events

const executeOnceOnDomContentLoaded = () => {
  // input helpers

  document.querySelectorAll("input").forEach((elm) => {
    elm.addEventListener("change", (e) => {
      if (e.target.value != "") {
        e.target.classList.add("filled");
      } else {
        e.target.classList.remove("filled");
      }
    });
  });
  document.querySelectorAll('input[type="search"]').forEach((elm) => {
    elm.value = "";
  });

  // a11y tab helper

  let activeElement = document.activeElement;
  document.addEventListener("keyup", (e) => {
    if (e.keyCode == window.KEYCODES.TAB) {
      if (
        activeElement.classList.contains("focus") &&
        e.target != activeElement
      ) {
        activeElement.classList.remove("focus");
      }
      if (
        e.target.classList.contains("regular-select-cover") ||
        e.target.classList.contains("search-field") ||
        e.target.classList.contains("product-item__link") ||
        e.target.classList.contains("content-slider") ||
        e.target.classList.contains("blog-item__header") ||
        e.target.classList.contains("toggle__title") ||
        e.target.tagName == "INPUT"
      ) {
        activeElement = e.target;
        e.target.classList.add("focus");
      }
    }
  });

  // newsletter has jump

  if (window.location.search == "?customer_posted=true") {
    setTimeout(() => {
      window.scroll({
        top: document.querySelector("form .alert").offsetTop - 250,
        behavior: "smooth",
      });
    }, 300);
  } else if (window.location.pathname.includes("/challenge")) {
    setTimeout(() => {
      window.scroll({
        top: 0,
        behavior: "auto",
      });
    }, 300);
  }
};

if (document.readyState !== "loading") {
  executeOnceOnDomContentLoaded();
} else {
  document.addEventListener("DOMContentLoaded", executeOnceOnDomContentLoaded);
}

// method for apps to tap into and refresh the cart

if (!window.refreshCart) {
  window.refreshCart = () => {
    fetch("?section_id=cart-helper")
      .then((response) => response.text())
      .then((text) => {
        const sectionInnerHTML = new DOMParser().parseFromString(
          text,
          "text/html"
        );
        const cartFormInnerHTML =
          sectionInnerHTML.getElementById("AjaxCartForm").innerHTML;
        const cartSubtotalInnerHTML =
          sectionInnerHTML.getElementById("AjaxCartSubtotal").innerHTML;

        const cartItems = document.getElementById("AjaxCartForm");
        cartItems.innerHTML = cartFormInnerHTML;
        cartItems.ajaxifyCartItems();
        document.querySelector("[data-header-cart-count]").textContent =
          cartItems.querySelector("[data-cart-count]").textContent;
        document.getElementById("AjaxCartSubtotal").innerHTML =
          cartSubtotalInnerHTML;
        document.querySelector(".sidebar__cart").show();
      });
  };
}

if (!window.addDatePicker) {
  const hourNow = new Date().getHours();
  $("#hourNow").val(hourNow);
  const todayString = new Date().toLocaleDateString("en-GB");

  //add black out date here, format:
  const datesDisabledBoth = ["26/01/2024"];
  const datesDisabledPickUp = [...datesDisabledBoth, "14/02/2024"];
  const datesDisabledDelivery = [
    ...datesDisabledBoth,
    "05/05/2024",
    "19/05/2024",
    "26/05/2024",
  ];

  const endDate = new Date(
    new Date().setDate(new Date().getDate() + 60)
  ).toLocaleDateString("en-GB");

  const pickUpSelected = () => {
    $("#js-pick-up-time").show();
    $("#date")
      .datepicker({
        startDate:
          hourNow > 13
            ? new Date(
                new Date().setDate(new Date().getDate() + 1)
              ).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
        endDate: endDate,
        datesDisabled: datesDisabledPickUp,
        format: "dd/mm/yy",
      })
      .on("changeDate", (e) => {
        const dateText = e.format("dd/mm/yyyy");

        //Sat&Sun we open from 10am - 4pm, So last pick up time is 4 pm
        let lastHourToPickUp = 17;
        if (e.date.getDay() === 0 || e.date.getDay() === 6) {
          lastHourToPickUp = 16;
        }
        if (dateText === todayString) {
          if (hourNow < 7 || hourNow > 13) {
            addPickupOptionsForTimePicker(
              setPickUpTime(10, lastHourToPickUp, 1)
            );
          } else {
            addPickupOptionsForTimePicker(
              setPickUpTime(hourNow + 3, lastHourToPickUp, 1)
            );
          }
        } else {
          addPickupOptionsForTimePicker(setPickUpTime(10, lastHourToPickUp, 1));
        }
      });
  };
  const DeliverySelected = () => {
    $("#js-delivery-time").show();
    $("#date")
      .datepicker({
        startDate:
          hourNow > 11
            ? new Date(
                new Date().setDate(new Date().getDate() + 1)
              ).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
        endDate: endDate,
        datesDisabled: datesDisabledDelivery,
        format: "dd/mm/yy",
      })
      .on("changeDate", (e) => {
        const dateText = e.format("dd/mm/yyyy");
        if (dateText === todayString && hourNow < 12) {
          addDeliveryOptionsForTimePicker(SetDeliveryTime(["PM"]));
        } else {
          addDeliveryOptionsForTimePicker(SetDeliveryTime(["AM", "PM"]));
        }
      });
  };
  const numberToTimeFormat = (number) => {
    if (number < 10 && number >= 0) return "0" + number + ":00";
    else if (number > 9 && number < 25) {
      return number + ":00";
    }
    return "00:00";
  };
  const addDeliveryOptionsForTimePicker = (options) => {
    $(".js-delivery-time-select").empty();
    $(".js-delivery-time-select").append(options);
  };
  const addPickupOptionsForTimePicker = (options) => {
    $(".js-pick-up-time-select").empty();
    $(".js-pick-up-time-select").append(options);
  };
  const setPickUpTime = (start, end, space) => {
    let resultArray = [];
    let current = start;
    while (current + space <= end) {
      const timeString =
        numberToTimeFormat(current) +
        " - " +
        numberToTimeFormat(current + space);
      const optionElement = document.createElement("option");
      optionElement.value = timeString;
      optionElement.innerHTML = timeString;
      resultArray.push(optionElement);
      current = current + space;
    }
    return resultArray;
  };
  const SetDeliveryTime = (array) => {
    return array.map((value) => {
      const optionElement = document.createElement("option");
      optionElement.value = value;
      optionElement.innerHTML = value;
      return optionElement;
    });
  };

  window.addDatePicker = () => {
    $(document).ready(function () {
      //add date check on submit
      $("[name='checkout']").click(function () {
        if ($("#date").val() == "" || $("#date").val() === undefined) {
          alert("You must pick a delivery date");
          return false;
        } else {
          //$(this).submit();
          return true;
        }
      });

      //init delivery toggle
      $(".cart__form .tabs .tab").unbind("click");
      $("#js-delivery-time, #js-pick-up-time").hide();
      $(".date-picker-wrapper").hide();
      $(".cart__form .tabs .tab").click((event) => {
        $(".cart__form .tabs .tab").removeClass("selected");
        $(event.currentTarget).addClass("selected");
        $("#js-delivery-time, #js-pick-up-time").hide();
        $("#date").val("");
        $(".date-picker-wrapper").show();
        $("#date").datepicker("destroy");
        $(".js-delivery-time-select").empty();
        $(".js-pick-up-time-select").empty();
        if ($(event.currentTarget).hasClass("pickup")) {
          pickUpSelected();
        } else {
          DeliverySelected();
        }
      });
    });
  };
}
