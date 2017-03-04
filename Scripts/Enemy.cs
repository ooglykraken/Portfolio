using UnityEngine;
using System.Collections;

using System.Collections.Generic;

public class Enemy : MonoBehaviour {

	private List<Hero> heroesInRange = new List<Hero>();
	public List<Enemy> enemiesInRange = new List<Enemy>();

	private int dc;
	private int damage;
	private float movementSpeed;
	private int attackSpeed;
	private int attackCooldown;
	private int range;
	private int maxHealth;
	public int health;
	public int xpValue;
	public int goldValue;
	public int currentTile;
	private int numberOfTiles;
	public int index;
	private int focusIndex;
	
	private int enemyHealCooldown;
	private int stealthCooldown;
	private int untilStealthDrops;
	public int fearTime;
	public int stunTime;
	public int poisonDamage;
	public int untilPoisonDamage;
	public int poisonTime;
	
	public bool ranged;
	private bool attacking;
	private bool detecting;
	public bool flying;

	private float healthBarWidth;
	
	private GameObject healthBar;
	
	private Gameplay gameplay;
	
	public Hero focus;
	
	public string type;
	public string status;
	
	public void Awake(){
		numberOfTiles = GameObject.FindGameObjectsWithTag("Path").Length;
	}
	
	public void FixedUpdate(){
		StatusEffect();
		
		GetComponent<Rigidbody>().velocity = Vector3.MoveTowards(GetComponent<Rigidbody>().velocity, Vector3.zero, Time.deltaTime * movementSpeed * 2f);
		
		HealthRender();
		
		if(status == "Fear" || status == "Stunned")
			return;
		
		switch(type){
			case "Fairy":
				FairyHeal();
				break;
			case "Vampire":
				break;
			case "Bat":
				break;
			case "Dragon":
				break;
			case "Troll":
				TrollHeal();
				break;
			case "Ghost":
				Stealth();
				break;
			default:
				break;
		}
		
		if(!attacking)
			MoveToFinish();	
		
		if(!detecting || !focus)
			attacking = false;
		
		if(!focus && type != "Fairy")
			Focus();
	}
	
	public void Update(){
		attackCooldown--;
		index = gameplay.enemies.IndexOf(this);
	
		if(health <= 0)
			Death();
	}
	
	public void OnCollisionStay(Collision c){
		if(focus  && status != "Stunned")
			Attack();
	}
	
	public void OnTriggerEnter(Collider c){
		if(c.tag == "Hero"){
			Detection(true);
			Hero visual = c.transform.parent.gameObject.GetComponent<Hero>();
			if(visual != null)
				if(!heroesInRange.Contains(visual))
					heroesInRange.Add(visual);
		} else if(c.tag == "Enemy"){
			Enemy visual = c.transform.parent.gameObject.GetComponent<Enemy>();
			if(!enemiesInRange.Contains(visual))
				enemiesInRange.Add(visual);
		}
	}
	
	public void OnTriggerStay(Collider c){
		if(c.tag == "Hero"){
			Detection(true);
			if(focus){
				if(ranged && status != "Stunned" && focus.status != "Invulnerable"){
					Attack();
				}
				else if(focus.ranged && status != "Stunned"){
					if(Vector3.Distance(transform.position, focus.transform.position) > 70){
						//rigidbody.velocity = Vector3.zero;
						transform.position = Vector3.MoveTowards(transform.position, focus.transform.position, Time.deltaTime);
					}
				}
			}
		}
	}
	
	public void OnTriggerExit(Collider c){
		if(c.tag == "Hero"){
			Hero leaving = c.transform.parent.gameObject.GetComponent<Hero>();
			Detection(false);
			if(leaving != null && heroesInRange.Contains(leaving)){
				heroesInRange.Remove(leaving);
				heroesInRange.TrimExcess();
				if(leaving == focus)
					focus = null;
			}
		} else if(c.tag == "Enemy"){
			Enemy leaving = c.transform.parent.gameObject.GetComponent<Enemy>();
			if(enemiesInRange.Contains(leaving)){
				enemiesInRange.Remove(leaving);
				enemiesInRange.TrimExcess();
			} 
		}
	}
	
	private void Attack(){
		if(focus)
			attacking = true;
			if(attackCooldown <= 0 && focus != null){
				if(focus.ranged)
					focus.FocusMe(index);
				attackCooldown = attackSpeed;
				focus.health -= damage;
				if(focus.health <= 0){
					heroesInRange.Remove(focus);
					heroesInRange.TrimExcess();
					foreach(Enemy e in transform.parent.GetComponentsInChildren<Enemy>()){
						if(e.focus == focus){
							e.focus = null;
						}
					}
					focus = null;
				}
			}
	}
	
	private void MoveToFinish(){
		if(currentTile < numberOfTiles){
			//rigidbody.velocity = Vector3.zero;
			Transform tile = GameObject.Find(currentTile.ToString()).transform;
			if(Vector2.Distance(new Vector2(transform.position.x, transform.position.y), new Vector2(tile.position.x, tile.position.y)) <= 5)	
				currentTile++;
			Vector3 targetPosition = new Vector3(tile.position.x, tile.position.y, -20f);
			transform.position = Vector3.MoveTowards(transform.position, targetPosition, Time.deltaTime * movementSpeed);
		} else {
			Debug.Log("Broke Stuff");
			Death();
		}
	}
	
	private void Detection(bool b){
		detecting = b;
	}
	
	private void StatusEffect(){
		switch(status){ 
			case "Fine":
				break;
			case "Poisoned":
				poisonTime--;
				untilPoisonDamage--;
				if(poisonTime > 0){
					Poisoned();
				} else {
					status = "Fine";
				}
				break;
			case "Frozen":
				break;
			case "Stunned":
				stunTime--;
				if(stunTime <= 0)
					status = "Fine";
				break;
			case "Stealth":
				break;
			case "Fear":
				fearTime--;
				if(fearTime < 0){
					status = "Fine";
					FindClosestTile();
				}
				else {
					Feared();
				}
				break;
		}
	}	
	
	private void Focus(){
		if(heroesInRange.Count != 0){ 
			int numberOfVisuals = heroesInRange.Count;
			focusIndex = 0;

			index = gameplay.enemies.IndexOf(this);
			
			while(focusIndex < numberOfVisuals){
				if(heroesInRange[focusIndex] != null && 
				(!heroesInRange[focusIndex].focus || heroesInRange[focusIndex].focus == gameplay.enemies[index]) && 
				heroesInRange[focusIndex].status != "Stealth"){
					focus = heroesInRange[focusIndex];
					break;
				} else {
					focusIndex++;
				}
			}
		}
	}
	
	public void FocusMe(int i){
		if(i < gameplay.heroes.Count){
			attacking = true;
			focus = null;
			focus = gameplay.heroes[i];
			if(heroesInRange.Contains(focus) && focus.ranged == true){
				if(!ranged && Vector3.Distance(transform.position, focus.transform.position) > 60){
					transform.position = Vector3.MoveTowards(transform.position, focus.transform.position, Time.deltaTime * movementSpeed);
				}
			}
		}
	}
	
	public void Birth(XMLNode e){
		gameplay = Gameplay.Instance();
	
		currentTile = 0;
		
		status = "Fine";
		
		type = e.GetValue("@type");
		maxHealth = int.Parse(e.GetValue("@health")); 
		health = int.Parse(e.GetValue("@health"));
		movementSpeed = (float)int.Parse(e.GetValue("@movement"));
		goldValue = int.Parse(e.GetValue("@gold"));
		xpValue = int.Parse(e.GetValue("@xp"));
		damage = int.Parse(e.GetValue("@damage"));
		range = int.Parse(e.GetValue("@range"));
		attackSpeed = int.Parse(e.GetValue("@speed"));
		attackCooldown = attackSpeed;
		
		string value = e.GetValue("@flying");
		if(value == "true")
			flying = true;
		else 
			flying = false;
		
		if(type != "Fairy")
			ranged = false;
		else
			ranged = true;
			
		detecting = false;
		
		focusIndex = 0;
		
		SphereCollider detection = transform.Find("Detection").GetComponent<SphereCollider>();
		detection.radius = range;

		transform.position = new Vector3(transform.position.x, transform.position.y, -20f);
		
		TextMesh textMesh;
		textMesh = transform.Find("CI").Find("Name").GetComponent<TextMesh>();
		textMesh.text = type;
		
		healthBar = transform.Find("CI/Health/Bar").gameObject;
		healthBarWidth = healthBar.transform.localScale.x;
		
		transform.parent = GameObject.Find("Enemies").transform;
		index = gameplay.enemies.IndexOf(this);
	}
	
	public void Death(){
		if(type == "Bloated"){
			int perLine = 2;
			int offset = 100;
			for(int i = 0; i < perLine; i++){
				for(int j = 0; j < perLine; j++){
					// these will be zombies
					Enemy e = Instantiate(Resources.Load("Enemies/Rat", typeof(Enemy)) as Enemy) as Enemy;
					
					XMLNode enemyXML = gameplay.enemiesXML[21] as XMLNode;
					
					e.Birth(enemyXML);
					
					gameplay.enemies.Add(e);
					e.index = gameplay.enemies.IndexOf(e);
					
					e.name = e.name.Split("("[0])[0];
					
					gameplay.enemiesLeft++;
					
					e.transform.position = new Vector3(transform.position.x + (i * offset), transform.position.y + (j * offset), -20f);
					e.currentTile = currentTile;
				}
			}
		}
		gameplay.enemiesLeft--;
		index = gameplay.enemies.IndexOf(this);
		foreach(Hero h in GameObject.Find("Heroes").GetComponentsInChildren<Hero>()){
			for(int i = 0; i < h.enemiesInRange.Count; i++){
				Enemy e = h.enemiesInRange[i];
				if(e == gameplay.enemies[index]){
					h.enemiesInRange.Remove(e);
					h.enemiesInRange.TrimExcess();
				}
			}
		}
		gameplay.enemies.Remove(gameplay.enemies[index]);
		gameplay.enemies.TrimExcess();
		Destroy(gameObject);
	}
	
	private void HealthRender(){
		float healthPercent = (float)health / (float)maxHealth;
		healthBar.transform.localScale = new Vector3(healthBarWidth * healthPercent, healthBar.transform.localScale.y, healthBar.transform.localScale.z );
	}
	
	private void Feared(){
		Transform tile = GameObject.Find("Spawner").transform;
		Vector3 targetPosition = new Vector3(tile.position.x, tile.position.y, -20f);
		transform.position = Vector3.MoveTowards(transform.position, targetPosition, Time.deltaTime * movementSpeed * 2f);
	}
	
	private void Poisoned(){
		if(untilPoisonDamage <= 0){
			health -= poisonDamage;
			untilPoisonDamage = 60;
		}
	}
	
	private void Stun(){
		if(focus){
			int chanceToStun = Random.Range(0, 2);
			int stunTime = 80;
			
			if(chanceToStun == 0){
				Debug.Log("Stun");
				focus.stunTime = stunTime;
				focus.status = "Stunned";
			}
			
			Attack();
		}	
	}
	
	private void Stealth(){
		if(status == "Fine"){
			stealthCooldown--;
			
			if(stealthCooldown <= 0){
				status = "Stealth";
				
				stealthCooldown = 240;
				untilStealthDrops = 120;
			}
		} else if(status == "Stealth"){
			untilStealthDrops--;
			if(untilStealthDrops <= 0){
				status = "Fine";
			}
		}
	}
	
	private void TrollHeal(){
		enemyHealCooldown--;
	
		int healthRestored = 1;
		
		if(health + healthRestored >= maxHealth){
			health = maxHealth;
		}else {
			health += healthRestored;
		}
	}
	
	private void Firebreath(){
			foreach(Hero h in heroesInRange){
				focus = h;
				Attack();
			}
	}
	
	private void FairyHeal(){
		enemyHealCooldown--;
		
		int healthRestored = 1;
		if(enemyHealCooldown <= 0){
			Debug.Log("Heal");
			foreach(Enemy e in enemiesInRange){
				if(e)
					if(e.health + healthRestored >= e.maxHealth)
						e.health = e.maxHealth;
					else
						e.health += healthRestored;
			}
			enemyHealCooldown = 90;
		}
	}
	
	public void FindClosestTile(){
		for(int i = 0; i < numberOfTiles; i++){
			if(Vector3.Distance(transform.position, GameObject.Find(i.ToString()).transform.position) < Vector3.Distance(transform.position, GameObject.Find(currentTile.ToString()).transform.position)){
				currentTile = i;
			}
		}
	}
}
