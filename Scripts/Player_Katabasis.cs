using UnityEngine;
using System.Collections;

public class Player : MonoBehaviour {

	public float movementSpeed;
	
	private float startingLightRange;
	// private float gravity;
	
	private float verticalBeltModifier;
	private float horizontalBeltModifier;
	
	private float worldBottom = 10f;
	
	private int verticalDirection;
	private int horizontalDirection;
	
	public int playerDirection;
	public int holdingBoxDirection;
	public int polarity;
	// private int fallingDelay = 30;
	// public int fallingTimer;
	
	public bool hasLoveLetter;
	public bool hasPocketwatch;
	public bool hasDogCollar;
	public bool hasTeddyBear;
	public bool hasFloorKey;
	public bool isWalking;
	public bool hasLantern;
	public bool hasLens;
	public bool hasLaser;
	private bool onConveyorBelt;
	public bool isTeleporting;
	public bool isFiringLaser;
	// public bool isFalling;
	public bool holdingBox;
	public bool grounded;

	private Transform position;
	private Transform lensTransform;
	private Transform lanternTransform;
	private Transform laserTransform;

	public GameObject lantern;
	
	public Lens lens;
	
	public Laser laser;

	private SpriteRenderer sprite;
	
	public Vector3 teleportLocation;
	private Vector3 playerScale;
	private Vector3 playerForward;

	public Sprite back;
	public Sprite front;
	public Sprite left;
	public Sprite right;
	public Sprite backLantern;
	public Sprite frontLantern;
	public Sprite leftLantern;
	public Sprite rightLantern;
	
	public Animator playerAnimator;
	
	public void Awake(){
		playerScale = transform.localScale;
		hasFloorKey = false;
		
		lens = Lens.Instance();
		laser = Laser.Instance();
		lantern = transform.Find ("Lantern").gameObject;
		sprite = transform.Find ("Sprite").gameObject.GetComponent<SpriteRenderer>();

		startingLightRange = lantern.GetComponent<Light>().range;
		
		playerAnimator = transform.Find("Animator").gameObject.GetComponent<Animator>();
		
		position = transform;
		
		
		horizontalBeltModifier = 0f;
		verticalBeltModifier = 0f;
		
		isTeleporting = false;
		isFiringLaser = false;
		grounded = false;
		
		if(Gameplay.Instance().spawnLocation != null){
			teleportLocation = Gameplay.Instance().spawnLocation.position;
		}
	}
	
	public void OnCollisionEnter(Collision c){
		
		if(c.transform.parent)
		{
			if(c.transform.parent.tag == "Key"){
				PickUpKey(c.transform.parent.gameObject);
			} else if(c.transform.parent.tag == "StairsDown"){
				if(hasFloorKey){
					Descend();
				} else {
					//He doesnt have the key yet
				}
			} else if(c.transform.parent.tag == "StairsUp"){
				Gameplay.Instance().FinishGame();
			} else {
			}
		}
		
	}
	
	public void OnCollisionStay(Collision c)
	{
		if (c.transform.name.Equals ("PurpleLightFloor"))
		{
			gameObject.transform.SetParent(c.transform.parent);
			
		}
		
	}
	
	public void OnCollisionExit(Collision c)
	{
		gameObject.transform.SetParent(null);
	}
	
	public void FixedUpdate(){
		if(isTeleporting){
			// Debug.Log(teleportLocation);
			transform.position = Vector3.Lerp(transform.position, teleportLocation, Time.deltaTime * 4);
			if(Vector3.Distance(transform.position, teleportLocation) <= 1f){
				gameObject.GetComponent<Rigidbody>().isKinematic = false;
				transform.Find("Collider").gameObject.GetComponent<Collider>().enabled = true;
				isTeleporting = false;
			}
			return;
		}
		
		grounded = CheckFeet();
		
		if(!grounded){
			Fall();
		} 
		// else {
			// transform.position = new Vector3(transform.position .x, transform.position.y, -1.1f);
		// }
		
		
		if(isFiringLaser){
			isWalking = false;
			GetComponent<Rigidbody>().velocity = new Vector3(0f, 0f, 0f);

			if(laser.laserTimer <= 0){

				isFiringLaser = false;
			}
			sprite.enabled = !isFiringLaser;
			playerAnimator.gameObject.SetActive(isFiringLaser);
			playerAnimator.SetInteger("Direction", playerDirection);
			playerAnimator.SetBool("isWalking", !isFiringLaser);
			playerAnimator.SetBool("hasLantern", !isFiringLaser);
			playerAnimator.SetBool("laser", isFiringLaser);
			return;
		}
		
		if(Input.GetKey("a")){
			horizontalDirection = -1;
		} else if(Input.GetKey("d")){
			horizontalDirection = 1;
		} else {
			horizontalDirection = 0;
		}
		
		if(Input.GetKey("w")){
			verticalDirection = 1;
			polarity = -1;
		} else if(Input.GetKey("s")){
			verticalDirection = -1;
			polarity = 1;
		} else {
			verticalDirection = 0;
		}
		
		string floorCast = CheckFloor();
		// Debug.Log(floorCast);
		if(PassableTerrain(floorCast)){
			if(floorCast == "ConveyorBelt"){
				onConveyorBelt = true;
			} else {
				horizontalBeltModifier = 0f;
				verticalBeltModifier = 0f;
				onConveyorBelt = false;
			}
			
			Move();
		} else if(floorCast == "Teleporter"){
			Teleport();
		}else if(floorCast == "" || floorCast == "LowerBoundary"){
			GetComponent<Rigidbody>().velocity = Vector3.zero;
			// Debug.Log("Falling");
			// isFalling = true;
			// fallingTimer = fallingDelay;
			// horizontalDirection = 0;
			// verticalDirection = 0;
			// transform.Find("Collider").gameObject.GetComponent<Collider>().enabled = false;
		}
	}
	
	public void Update(){
		if (Input.GetKeyUp (KeyCode.LeftArrow) && hasLens && !holdingBox) 
		{
			
			lens.Ping();
		}
		
		if (Input.GetKeyUp (KeyCode.RightArrow) && hasLaser && !holdingBox) 
		{
			isFiringLaser = true;
			playerAnimator.gameObject.SetActive(false);
			playerAnimator.gameObject.SetActive(true);
			playerAnimator.SetBool("laser", true);
			playerAnimator.SetInteger("Direction", playerDirection);
			
			laser.Fire();

		}

		if (Input.GetKeyUp (KeyCode.UpArrow))
		{
			// Debug.Log("Activating");
			Activate();
		}	
		
		if(holdingBox){
			if(Vector3.Distance(transform.position, transform.FindChild("Box").position) > 2.1f){
				GrabOrDropBox(transform.FindChild("Box").gameObject);
			}
		}
	}
	
	public void LateUpdate(){
		CameraFollow();
	}
	
	private void Move(){

		if(verticalDirection < 0 && horizontalDirection == 0){
			Turn("down");
		} else if(verticalDirection > 0 && horizontalDirection == 0){
			Turn("up");
		} else if(horizontalDirection < 0 && verticalDirection == 0){
			Turn("left");
		} else if(horizontalDirection > 0 && verticalDirection == 0){
			Turn("right");
		} else if(horizontalDirection > 0 && verticalDirection < 0){
			Turn("r-d");
		} else if(horizontalDirection < 0 && verticalDirection < 0){
			Turn("l-d");
		} else if(horizontalDirection > 0 && verticalDirection > 0){
			Turn("r-u");
		} else if(horizontalDirection < 0 && verticalDirection > 0){
			Turn("l-u");
		}
		
		float speedModifier = 1f;
		
		// horizontalBeltModifier = 1f;
		// verticalBeltModifier = 1f;
		
		if(horizontalDirection != 0 && verticalDirection != 0){
			speedModifier = .83f;
		}
		
		GetComponent<Rigidbody>().velocity = new Vector3(horizontalDirection * movementSpeed * speedModifier, verticalDirection * movementSpeed * speedModifier, 0f) + new Vector3(horizontalBeltModifier, verticalBeltModifier, 0f);
		
		if(horizontalDirection == 0 && verticalDirection == 0){
			gameObject.GetComponent<AudioSource>().Stop();
			isWalking = false;
		} else {
			if(!isWalking){
				gameObject.GetComponent<AudioSource>().Play();
			}
			isWalking = true;
		}
		
		sprite.enabled = !isWalking;
		playerAnimator.gameObject.SetActive(isWalking);
		playerAnimator.SetBool("hasLantern", hasLantern);
		playerAnimator.SetBool("laser", isFiringLaser);
		// playerAnimator.SetInteger("Direction", playerDirection);
		if(isWalking){
			if(!holdingBox){
				playerAnimator.SetInteger("Direction", playerDirection);
			} else if(holdingBox) {
				playerAnimator.SetInteger("Direction", holdingBoxDirection);
			} else {
				Debug.Log("there's something wrong with animation and box grabbing");
			}
			playerAnimator.SetBool("isWalking", isWalking);
		}
		
		if (holdingBox)
		{
			if(horizontalDirection != 0 && verticalDirection != 0){
				speedModifier = .83f;
			}
			if(transform.FindChild("Box")){
				transform.FindChild ("Box").GetComponent<Rigidbody>().velocity = new Vector3(horizontalDirection * movementSpeed * speedModifier, verticalDirection * movementSpeed * speedModifier, 0f);
			} else if(transform.FindChild("Box-Invisible")) {
				transform.FindChild ("Box-Invisible").GetComponent<Rigidbody>().velocity = new Vector3(horizontalDirection * movementSpeed * speedModifier, verticalDirection * movementSpeed * speedModifier, 0f);
			} else {
				Debug.Log("Box not found!");
			}
		}
	}
	
	private void Fall(){
		
		if(transform.position.z >= worldBottom){
			Teleport();
			// isFalling = false;
			Resize(1f);
			transform.Find("Collider").gameObject.GetComponent<Collider>().enabled = true;
		} else {
			Debug.Log(transform.position.z /  worldBottom);
			Resize(1f - (1.1f + transform.position.z) /  worldBottom);
		} 
		isWalking = false;
		Debug.Log("isFalling is true");
		// GetComponent<Rigidbody>().velocity = movementSpeed * transform.forward + new Vector3(0f, 0f,  (20f * Time.deltaTime));
		transform.position += new Vector3(0f, 0f, .75f);

	
	}
	
	private void Activate()
	{
		if(holdingBox){
			if(transform.FindChild("Box")){
				GrabOrDropBox(transform.Find("Box").gameObject);
			} else if(transform.FindChild("Box-Invisible")) {
				GrabOrDropBox(transform.Find("Box-Invisible").gameObject);
			}
			
			return;
		}
	
		RaycastHit hit;
		Vector3 ray = new Vector3(transform.Find("Collider").position.x, transform.Find("Collider").position.y, transform.position.z); //Vector3.zero;
		
		float radius = 2f;
		
		Vector3 direction = Vector3.zero;
		
		
		
		if(!holdingBox){
			switch(playerDirection){
				case(0):
					direction = -transform.up;
					break;
				case(1):
					direction = -transform.right;
					break;
				case(2):
					direction = transform.up;
					break;
				case(3):
					direction = transform.right;
					break;
				default:
					break;
			}
		} else {
			switch(holdingBoxDirection){
				case(0):
					direction = -transform.up;
					break;
				case(1):
					direction = -transform.right;
					break;
				case(2):
					direction = transform.up;
					break;
				case(3):
					direction = transform.right;
					break;
				default:
					break;
			}
		}
		
		// Debug.Log(direction);
		
		// Shoot a ray from 
		
		if (Physics.SphereCast(ray - (2 * direction), radius, direction, out hit, 1f))
		{
			// Debug.Log(hit.transform.tag);
			Transform target = hit.transform;
			// Debug.Log(target.tag);
			  switch (target.tag)
			  {
			  	case ("Box"):
			  		GrabOrDropBox(target.gameObject);
			  		break;
			  	case ("NPC"):
			  		target.gameObject.GetComponent<NPC>().Talk();
			  		break;

			  	case ("LightBeacon"):
			  		target.gameObject.GetComponent<LightBeacon>().TakeLight();
			  		break;

				case ("WallSwitch"):
			  		target.parent.gameObject.GetComponent<WallSwitch>().ActivateSwitch();
			  		break;
				case ("Gravestone"):
			  		target.parent.gameObject.GetComponent<Gravestone>().ReadStone();
			  		break;
				default:
					Speak("There's nothing there.");
					break;
			  }
		} else {
			Speak("There's nothing there.");
		}
	}
	
	private void GrabOrDropBox(GameObject o)
	{
		if (!holdingBox)
		{
			holdingBoxDirection = playerDirection;
			o.transform.SetParent(transform);
			holdingBox = true;
		}
		else
		{
			if (transform.Find("Box"))
			{
				transform.Find("Box").SetParent(null);
				holdingBox = false;
			} else if(transform.Find("Box-Invisible")){
				transform.Find("Box-Invisible").SetParent(null);
				holdingBox = false;
			}
		}
	}
	
	private void PickUpKey(GameObject key){
		hasFloorKey = true;
		key.transform.Find("Collider").gameObject.GetComponent<Key>().PickUpKey();
		Speak("I picked up a key....");
	}
	
	public void Descend(){
		Gameplay.Instance().NextLevel();
		hasFloorKey = false;
	}
	
	private bool CheckForWalls(){
		
		
		int layerMask = (int)(1<<9);
		layerMask = ~layerMask;
		
		// I'm increasing this by an arbitrary number to account for the bug where light doesn't readjust properly
		float distance = startingLightRange + 10;
		RaycastHit hit;
	
		Vector3 ray  = new Vector3(transform.position.x, transform.position.y, transform.lossyScale.z * .5f);
		if (Physics.Raycast(ray, transform.up, out hit)) {
			if (Vector3.Distance(transform.position, hit.point) <= distance && (hit.transform.tag == "Wall" || hit.transform.tag == "Door")){
				lantern.GetComponent<Light>().range = Vector3.Distance(transform.position, hit.point) + 2f;
				return true;
			}

		}
		
		return false;
	}
	
	private string CheckFloor(){

		RaycastHit hit;
		
		// float distance = 1.1f;
		
		Vector3 ray = transform.Find("Collider").position + new Vector3(horizontalDirection *.35f, verticalDirection * .35f, transform.position.z);
		
		if (Physics.Raycast(ray, Vector3.forward, out hit)){
			
			
			//Trying to catch errors with objects that have no parent parents
			// if(hit.transform.parent == null){
				// return;
			// }
			// Debug.Log(hit.transform.tag);
			if(hit.transform.parent != null && hit.transform.parent.parent != null && hit.transform.parent.parent.tag == "MovingPlatform"){
				transform.parent = hit.transform.parent;
			} else if(hit.transform.tag == "MovingPlatform"){
				transform.parent = hit.transform;
				return hit.transform.tag;
			} else {
				transform.parent = null;
			}
			
			if (hit.transform.gameObject.name == "Conveyor Belt" || hit.transform.gameObject.name == "Box" || hit.transform.gameObject.name == "FloorSwitch" || hit.transform.gameObject.name == "InvisibleFloorSwitch" || hit.transform.tag == "NPC" || hit.transform.gameObject.name == "Teleporter")
			{
				// Debug.Log("Raycast Starts Here: " + ray + ". And it hits here: " + hit.point);
				// How do we make the conveyor belt move the player
				if(hit.transform.gameObject.name == "Conveyor Belt"){
					ConveyorBelt belt = hit.transform.gameObject.GetComponent<ConveyorBelt>();
					OnConveyorBelt(belt.isHorizontal, belt.isReverse);
				}
				return hit.transform.tag;

			} else {
				// Debug.Log("Raycast Starts Here: " + ray + ". And it hits here: " + hit.point);
				if(hit.transform.parent == null){
					return hit.transform.tag;
				} else {
					return hit.transform.parent.tag;
				}
			}
			
		}
		
		return "";
	}
	
	private bool CheckFeet(){

		RaycastHit hit;
		
		float distance = 2f;
		
		Vector3 ray = transform.Find("Collider").position;
		
		if (Physics.Raycast(ray, Vector3.forward, out hit)){
			
			if(hit.distance <= distance && hit.transform.tag != "LowerBoundary"){
				return true;
			}
		}
		
		return false;
	}
	
	private void Turn(string direction){
		// Before this was to turn the boy it is now repurposed to change the direction of the lantern
	
		Vector3 newFacing = lantern.transform.eulerAngles;
		
		switch(direction){
			case "up":
				if(!holdingBox){
					newFacing = new Vector3(270f, 90f, 0f);
					playerForward = new Vector3(0f, 1f, 0f);
					if(hasLantern){
						sprite.sprite = backLantern;
					} else {
						sprite.sprite = back;
					}
				}
				playerDirection = 2;
				break;
			case "down":
				if(!holdingBox){
					newFacing = new Vector3(90f, 90f, 0f);
					playerForward = new Vector3(0f, -1f, 0f);
					if(hasLantern){
						sprite.sprite = frontLantern;
					} else {
						sprite.sprite = front;
					}
				}
				playerDirection = 0;		
				break;
			case "left":
				if(!holdingBox){
					newFacing = new Vector3(180f, 90f, 0f);
					playerForward = new Vector3(-1f, 0f, 0f);
					if(hasLantern){
						sprite.sprite = leftLantern;
					} else {
						sprite.sprite = left;
					}
				}
				playerDirection = 1;
				break;
			case "right":
				if(!holdingBox){
					newFacing = new Vector3(0f, 90f, 0f);
					playerForward = new Vector3(1f, 0f, 0f);
					if(hasLantern){
						sprite.sprite = rightLantern;
					} else {
						sprite.sprite = right;
					}
				}
				playerDirection = 3;
				break;
			case "r-d":
				newFacing = lantern.transform.eulerAngles;
				break;
			case "l-d":
				newFacing = lantern.transform.eulerAngles;
				break;
			case "r-u":
				newFacing = lantern.transform.eulerAngles;
				break;
			case "l-u":
				newFacing = lantern.transform.eulerAngles;
				break;
			default:
				break;
		}
		lantern.transform.eulerAngles = newFacing;
		laser.transform.eulerAngles = newFacing;
	}
	
	private void CameraFollow(){
		float cameraOffset = .6f;
		Camera main = Camera.main;

		if(transform.position.x  >  main.transform.position.x + cameraOffset){
			main.transform.position = new Vector3( transform.position.x - cameraOffset, main.transform.position.y, main.transform.position.z);
		} else if(transform.position.x  <  main.transform.position.x - cameraOffset){
			main.transform.position = new Vector3( transform.position.x + cameraOffset, main.transform.position.y, main.transform.position.z);
		}
		if(transform.position.y  >  main.transform.position.y + cameraOffset){
			main.transform.position = new Vector3(main.transform.position.x, transform.position.y - cameraOffset, main.transform.position.z);
		} else if(transform.position.y  <  main.transform.position.y - cameraOffset){
			main.transform.position = new Vector3(main.transform.position.x, transform.position.y + cameraOffset, main.transform.position.z);
		}
	}
	
	public void Speak(string message){
		//dictates where text appears in relation to player

		// if(verticalDirection == 1){
			// polarity = -1;
		// } else if(verticalDirection == -1){
			// polarity = 1;
		// }
		
		TextBox.Instance().UpdateText(message);
	}
	
	public void Teleport()
	{
		if(Gameplay.Instance().spawnLocation != null){
			teleportLocation = Gameplay.Instance().spawnLocation.position;
		}
		transform.Find("Collider").GetComponent<Collider>().enabled = false;
		gameObject.GetComponent<Rigidbody>().isKinematic = true;
		Gameplay.Instance().spawnLocation.gameObject.GetComponent<AudioSource>().Play();
		isTeleporting = true;
		
	}
	
	public void Teleport(Vector3 newPosition)
	{
		teleportLocation = newPosition;
		transform.Find("Collider").GetComponent<Collider>().enabled = false;
		gameObject.GetComponent<Rigidbody>().isKinematic = true;
		Gameplay.Instance().spawnLocation.gameObject.GetComponent<AudioSource>().Play();
		isTeleporting = true;
	}
	
	private void Spawn(){
		transform.position = new Vector3(teleportLocation.x, teleportLocation.y, transform.position.z);
	}
	
	private bool PassableTerrain(string s){
		return s == "Floor" || s == "FloorSwitch" || s == "InvisibleFloor" || s == "Box" || s == "WallSwitch" || s == "Statue" || s == "ConveyorBelt" || s == "MovingPlatform" || s == "Key" || s == "StairsDown" || s == "NPC";
	}
	
	private void OnConveyorBelt(bool isHorizontal, bool isReverse){
		float speed = 1f;
		
		if(isHorizontal){
			verticalBeltModifier = 0f;
			if(isReverse){
				horizontalBeltModifier = -speed;
			} else {
				horizontalBeltModifier = speed;
			}
		} else if(!isHorizontal){
			horizontalBeltModifier = 0f;
			if(isReverse){
				verticalBeltModifier = -speed;
			} else {
				verticalBeltModifier = speed;
			}
		}
	}
	
	private void Resize(float sizeRatio){
		Debug.Log(sizeRatio);
		transform.localScale = playerScale * (sizeRatio);
	}
	
	private static Player instance;
	
	public static Player Instance(){
		if (instance == null)
			instance = GameObject.FindObjectOfType<Player>();
			
		return instance;
	}
}
