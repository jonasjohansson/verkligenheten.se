var THREEx = THREEx || {};
var radius360Sphere = 3;
var zOffset = -0.1;

THREEx.Portal360 = function(videoImageURL, doorWidth, doorHeight) {
	var doorCenter = new THREE.Group();

	this.object3d = doorCenter;

	//videoImageURL = document.querySelector(videoImageURL).getAttribute('src');

	var isVideo = videoImageURL.match(/.(mp4|mov|webm|ogv)/i) ? true : false;

	var texture60;

	if (isVideo) {
		var video = document.createElement('video');
		video.src = videoImageURL;
		video.width = 640;
		video.height = 360;
		video.loop = true;
		video.autoplay = true;
		video.muted = true;
		video.load();
		video.crossOrigin = 'anonymous';
		video.setAttribute('playsinline', 'playsinline');
		video.play();
		texture360 = new THREE.VideoTexture( video );
		texture360.minFilter = THREE.LinearFilter;
		texture360.format = THREE.RGBFormat;	
		texture360.flipY = false;
	  texture360.offset.set(0.25, 0);
	} else {
		texture360 = new THREE.TextureLoader().load(videoImageURL)
		texture360.minFilter = THREE.NearestFilter;
		texture360.format = THREE.RGBFormat;
		texture360.flipY = false;
	}


	// create insideMesh which is visible IIF inside the portal

	var insideMesh = this._buildInsideMesh(texture360, doorWidth, doorHeight);
	doorCenter.add(insideMesh);
	this.insideMesh = insideMesh;

	// create outsideMesh which is visible IIF outside the portal

	var outsideMesh = this._buildOutsideMesh(texture360, doorWidth, doorHeight);
	doorCenter.add(outsideMesh);
	this.outsideMesh = outsideMesh;

	// create frameMesh for the frame of the portal

	var frameMesh = this._buildRectangularFrame(doorWidth / 100, doorWidth, doorHeight);
	doorCenter.add(frameMesh);
};

THREEx.Portal360.prototype._buildInsideMesh = function(texture360, doorWidth, doorHeight) {
	var doorInsideCenter = new THREE.Group();
	var geometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
	var material = THREEx.Portal360.buildTransparentMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.y = Math.PI;
	doorInsideCenter.add(mesh);
	var geometry = new THREE.SphereGeometry(radius360Sphere, 16, 16).rotateZ(Math.PI);
	var material = new THREE.MeshBasicMaterial({
		map: texture360,
		side: THREE.DoubleSide
	});
	var sphere360Mesh = new THREE.Mesh(geometry, material);
	sphere360Mesh.position.z = zOffset;
	sphere360Mesh.rotation.y = Math.PI;
	doorInsideCenter.add(sphere360Mesh);
	return doorInsideCenter;
};

THREEx.Portal360.prototype._buildOutsideMesh = function(texture360, doorWidth, doorHeight) {
	var doorOutsideCenter = new THREE.Group();
	var squareCache = THREEx.Portal360.buildSquareCache();
	squareCache.scale.y = doorWidth;
	squareCache.scale.y = doorHeight;
	doorOutsideCenter.add(squareCache);
	var geometry = new THREE.SphereGeometry(radius360Sphere, 16, 16, Math.PI, Math.PI, 0, Math.PI).rotateZ(Math.PI);
	geometry.faceVertexUvs[0].forEach(function(faceUvs) {
		faceUvs.forEach(function(uv) {
			uv.x /= 2;
		});
	});
	geometry.uvsNeedUpdate = true;
	var material = new THREE.MeshBasicMaterial({
		map: texture360,
		side: THREE.BackSide,
	});
  
  mxaterial = new THREE.MeshPhongMaterial({
  	side:THREE.DoubleSide,
  	color:0x0000ff
  });
	
  var sphere360Mesh = new THREE.Mesh(geometry, material);
	sphere360Mesh.position.z = zOffset;
	doorOutsideCenter.add(sphere360Mesh);

	return doorOutsideCenter;
};
THREEx.Portal360.prototype._buildRectangularFrame = function(radius, width, height) {
	var container = new THREE.Group();
	var material = new THREE.MeshNormalMaterial();
	var material = new THREE.MeshPhongMaterial({
		color: 'silver',
		emissive: 'black',
		transparent: true,
		opacity: 0
	});
	var geometryBeamVertical = new THREE.CylinderGeometry(radius, radius, height - radius);
	// mesh right
	var meshRight = new THREE.Mesh(geometryBeamVertical, material);
	meshRight.position.x = width / 2;
	container.add(meshRight);
	// mesh right
	var meshLeft = new THREE.Mesh(geometryBeamVertical, material);
	meshLeft.position.x = -width / 2;
	container.add(meshLeft);
	var geometryBeamHorizontal = new THREE.CylinderGeometry(radius, radius, width - radius).rotateZ(Math.PI / 2);
	// mesh top
	var meshTop = new THREE.Mesh(geometryBeamHorizontal, material);
	meshTop.position.y = height / 2;
	container.add(meshTop);
	// mesh bottom
	var meshBottom = new THREE.Mesh(geometryBeamHorizontal, material);
	meshBottom.position.y = -height / 2;
	container.add(meshBottom);
	return container;
};

THREEx.Portal360.prototype.update = function() {
	var localPosition = new THREE.Vector3();
	this.object3d.worldToLocal(localPosition);
	var isOutsidePortal = localPosition.z >= 0 ? true : false;
	if (isOutsidePortal) {
		this.outsideMesh.visible = true;
		this.insideMesh.visible = false;
	} else {
		this.outsideMesh.visible = false;
		this.insideMesh.visible = true;
	}
};

THREEx.Portal360.buildSquareCache = function() {
	var container = new THREE.Group();
	// add outter cube - invisibility cloak
	var geometry = new THREE.PlaneGeometry(50, 50);
	var material = THREEx.Portal360.buildTransparentMaterial();
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = geometry.parameters.width / 2 + 0.5;
	mesh.position.y = -geometry.parameters.height / 2 + 0.5;
	container.add(mesh);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = -geometry.parameters.width / 2 + 0.5;
	mesh.position.y = -geometry.parameters.height / 2 - 0.5;
	container.add(mesh);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = -geometry.parameters.width / 2 - 0.5;
	mesh.position.y = geometry.parameters.height / 2 - 0.5;
	container.add(mesh);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = +geometry.parameters.width / 2 - 0.5;
	mesh.position.y = geometry.parameters.height / 2 + 0.5;
	container.add(mesh);
	return container;
};

THREEx.Portal360.buildTransparentMaterial = function() {
	if (THREEx.Portal360.buildTransparentMaterial.material) {
		return THREEx.Portal360.buildTransparentMaterial.material;
	}
	var material = new THREE.MeshBasicMaterial({
		colorWrite: false
	});
	THREEx.Portal360.buildTransparentMaterial.material = material;
	return material;
};
