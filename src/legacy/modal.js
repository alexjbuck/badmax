    // When the user clicks on the button, open the modal
    var openModal = function(content) {
        $("#modalContent").html(content)
        document.getElementById("myModal").style.display = "block";
    }
    
    var closeModal = function() {
        document.getElementById("myModal").style.display = "none";
    }
    
    // When the user clicks on <span> (x), close the modal
    document.getElementById("closeSpan").onclick = function() {
        document.getElementById("myModal").style.display = "none";
    }
        
    // When the user clicks anywhere outside of the modal, close it
    window.onmousedown = function(event) {
        if (event.target == document.getElementById("myModal")) {
            document.getElementById("myModal").style.display = "none";
        }
    }