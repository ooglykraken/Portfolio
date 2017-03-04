using UnityEngine;
using System.Collections;

public class Player : MonoBehaviour {
	
	private float laserCooldown = 20f ;
	private float laserTimer;
	
	private Transform laserWeapon;
	
	public float verticalSpeed = 15f;
	public float horizontalSpeed = 12f;
	
	public float horizontalInput;
	public float verticalInput;
	
	private float timeModifier = 8f;
	
	private Rigidbody playerRigidBody;

	private SpriteRenderer playerSprite;
	
	public int health = 3;
	
	private bool invulnerable;
	
	private bool damaged;
	
	private static int damageTime = 30;
	private int damageTimer;
	
	private bool platformIsMobile;
	
	public void Awake(){
		playerRigidBody = gameObject.GetComponent<Rigidbody>();
		
		playerSprite = transform.Find("Sprite").gameObject.GetComponent<SpriteRenderer>();
		horizontalInput = 0f;
		verticalInput = 0f;
		
		laserWeapon = transform.Find("LaserWeapon");
		
		invulnerable = false;
		damaged = false;
		
		this.platformIsMobile = Gameplay.Instance().platformIsMobile;
	}
	
	public void Update(){
		
		bool willFire = false;
		verticalInput = 0f;
		if(platformIsMobile){
			
			Vector2 playerPixelLocation = Camera.main.WorldToScreenPoint(transform.position);
			
			foreach(Touch t in Input.touches){
				if(t.position.x > Screen.width/2f){ //Touched on right side of screen
					willFire = true;
				} else if(t.position.x < Screen.width/2f) { //Touched on left side of screen
					 if(t.position.y < playerPixelLocation.y){ //Touched below player character
						verticalInput = -1f;
					} else if(t.position.y > playerPixelLocation.y){ //Touched above player character
						verticalInput = 1f;
					} else {
						verticalInput = 0f;
					}
				} else {
					verticalInput = 0f;
				}
			}
		} else {

			horizontalInput = 0f;
			verticalInput = Input.GetAxis("Vertical");
			if(Input.GetKey("space") || Input.GetButton("Fire1")){
				willFire = true;
			}
			
		}
		
		if(laserTimer <= 0){
			laserTimer = 0f;
			
			if(willFire){
				FireLaser();
			}
			
		} else {
			laserTimer--;
		}
		
		if(damaged){
				damageTimer--;
			if(damageTimer <= 0){
				damaged = false;
			} else {
				Flash();
			}
		} else {
			playerSprite.enabled = true;
		}
	}
	
	public void FixedUpdate(){
		
		Move();
	}
	
	public void Move(){
		Vector3 newVelocity = new Vector3(horizontalInput * horizontalSpeed, verticalInput * verticalSpeed, 0f);
		
		playerRigidBody.velocity = Vector3.Lerp(playerRigidBody.velocity, newVelocity, Time.deltaTime * timeModifier);
	}
	
	private void FireLaser(){
		Laser laser = Instantiate(Resources.Load("Projectiles/Laser", typeof (Laser)) as Laser) as Laser; 

		laser.transform.position = laserWeapon.position;
		laser.GetComponent<Rigidbody>().velocity = new Vector3(2f * horizontalSpeed, 0f, 0f);
		laser.transform.parent = transform;
		laserTimer = laserCooldown;
		
		laserWeapon.gameObject.GetComponent<AudioSource>().Play();
	}
	
	public void PlayerDamage(){
		
		if(invulnerable){
			return;
		}
		
		health--;
		if(health <= 0){
			Gameplay.Instance().PlayerDeath();
		} else {
			damaged = true;
			damageTimer = damageTime;
		}
	}
	
	private void Flash(){
		playerSprite.enabled = !playerSprite.enabled;
	}
	
	private static Player instance = null;
	
	public static Player Instance(){
		if(instance == null){
			instance = GameObject.Find("Player").GetComponent<Player>();
		}
		
		return instance;
	}
}
