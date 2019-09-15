AFRAME.registerComponent('arjs-portal-door', {
  schema: {
    url: {
      type: 'string'
    },
    id: {
      type: 'string'
    },
    doorWidth: {
      type: 'number',
      default: 1
    },
    doorHeight: {
      type: 'number',
      default: 1
    }
  },
  init: function() {
    var doorWidth = this.data.doorWidth;
    var doorHeight = this.data.doorHeight;
    var imageURL = this.data.url;

    var portalDoor = new THREEx.Portal360(imageURL, doorWidth, doorHeight);
    this.portalDoor = portalDoor;
    this.el.object3D.add(this.portalDoor.object3d);

    switch (this.data.id){
      case "sun":
		    this.sun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 0.1, 0.1), sunMaterial);
		    this.sun.add(new THREE.PointLight(0xff5300, 24, 1500));
		    this.portalDoor.outsideMesh.add(this.sun);
        break;
    }
  },
  tick: function() {
    this.portalDoor.update();
    switch (this.data.id){
      case "sun":
		    let angle = new Date().getTime() * 0.001;
		    this.sun.position.set(0, 0, Math.sin(angle) * 2);
        break;
    }
  }
});
AFRAME.registerPrimitive(
  'a-portal-door',
  AFRAME.utils.extendDeep({}, AFRAME.primitives.getMeshMixin(), {
    defaultComponents: {
      'arjs-portal-door': {}
    },
    mappings: {
      url: 'arjs-portal-door.url'
    }
  })
);
