# generic_js_camera_interface
Provides a generic js camera gui and facial recogition/cropping

# To Run
Setup a simply python server using ```python3 -m http.server```

# Functionality

This repo contains a simple template for an app that uses a camera. The gui can be accessed by pressing the 'g' button and allows the user to take a camera with any orientation and change its angle to suit your needs. You can also scale the camera output to fit the desired area as it is designed to fill the div that contains it. 

This template is also set up to send a cropped image of any face detected to a backend. If that functionality is desired simply edit the sendCroppedData function in the artwork.js file and the POST_URL parameter in the params.js file. 

This was taken from a piece designed to work with a flask backed application but other architectures should be simple to integrate. 
