using UnityEngine;
using System.Collections;

using System.Collections.Generic;

public class Hero : MonoBehaviour {
	
	//0 - Rogue
	//1 - Warrior
	//2 - Cleric
	//3 - Druid
	//4 - Monk
	//5 - Ranger
	//6 - Wizard
	
	private string[,] firstNames = new string[7,10] 
	{
		{"Joe","Davin","Shaun","Melvin", "Moggle", "Robder", "Harold", "Mick", "Ben", "Berry"},
		{"Thadeus", "Bjorn", "The Incredible", "Blood", "Darius", "Tiberius","Gib", "Vincent", "Bruce", "John"},
		{"Clark", "Pablo", "Samgee", "Schnider", "Richter", "Paxton", "Ryan", "Chad", "Markus", "Peter"},
		{"Fenris", "Karl", "Carl", "Qarl", "Steve", "Sven", "Brock", "James", "Brandon", "Clive"},
		{"Chris","Ian","Gustaf", "John", "Clayton", "Ali", "Caden", "Guillermo", "Auron", "Titus"},
		{"Richard", "Robert", "William", "Charles", "Michael", "Dante", "Miguel", "Mitsurugi", "Desmond", "Xavier"},
		{"Rettuc","Frederick", "Hans", "Steven", "Starchie", "Zachary", "Midas", "Austin", "Gregory", "Abraham"}
	};
	private string[,] lastNames = new string[7,10] 
	{
		{"Rank", "Spillthief","Bombadill", "the Sly", "Bellbags", "Goldman", "Sneakfoot", "Slickson", "Ford", "Sticky Fingaz"},
		{"Oakhand", "Thromgurd", "Mulk", "Savage", "Stormbeard", "Shatterstone", "Melson", "Banespike", "Crambell", "Spartan"},
		{"Goodman", "Griswald", "Wisejam", "Schnider", "Strongarm", "Faith", "Smarts", "Wellingsworth", "Odinson", "Stills"},
		{"Wolfguard", "of the Sea", "delArbor", "Urdan", "Hawk-kin", "Wildson", "Colly", "Roots", "Firebane", "Bark"},
		{"Chen", "Fjord", "Mjolnir", "Smith", "Heavyhand", "Nomad", "Tormey", "Fringe", "Ironskin", "Wake"},
		{"Longstride","Bowbane", "Forest-strider", "Far-arrow", "Flossbender", "Quickhand", "Cervantes", "Rinji", "Frost", "Blood"},
		{"Black-finger", "All-wise", "Wormhat", "Oggle", "Bonethorpe", "Bodem", "Flamesear", "Goldfinger", "Grim", "Awe-eye"}
	};
	
	XMLNodeList levelsXML;
	XMLNode levelXML;
	XMLNode heroXML;
	
	private Tavern tavern;
	
	public List<Enemy> enemiesInRange = new List<Enemy>();
	public List<Hero> heroesInRange = new List<Hero>();
	
	private Gameplay gameplay;
	
	public Enemy focus;
	
	private GameObject healthBar;
	
	public bool activated;
	private bool safe;
	private bool detecting;
	public bool ranged;
	
	private float healthBarWidth;
	private float movementSpeed = 200f;
	private float knockbackForce = 500f;
	
	public int lv;
	public int damage;
	public int attackSpeed;
	public float range;
	private int xp;
	private int toNextLevel;
	public int health;
	private int maxHealth;
	private int intJob;
	private int attackCooldown;
	public int numberOfTargets;
	public int maxNumberOfTargets;
	private int focusIndex;
	private int index;
	
	public string strJob;
	public string firstName;
	public string lastName;
	public string status;
	
	private Vector3 post;
	private Vector3 mousePosition;
	
	private int battlecryCooldown;
	private int clericHealCooldown;
	private int invulnerableCooldown;
	private int stealthCooldown;
	private int untilStealthDrops;
	private bool canPoison;
	public int stunTime;
	public int poisonDamage;
	public int untilPoisonDamage;
	public int poisonTime;
	private int invulnerableTime;
	
	public void OnTriggerEnter(Collider c){
		if(c.tag == "Enemy"){
			Detection(true);
			Enemy visual = c.transform.parent.gameObject.GetComponent<Enemy>();
			if(!enemiesInRange.Contains(visual))
				enemiesInRange.Add(visual);
		} else if(c.tag == "Hero"){
			Hero visual = c.transform.parent.gameObject.GetComponent<Hero>();
			if(!heroesInRange.Contains(visual)){
				heroesInRange.Add(c.transform.parent.gameObject.GetComponent<Hero>());
			}
		}
	}
	
	public void OnTriggerStay(Collider c){
		if(c.tag == "Enemy"){
			if(c.transform.parent.gameObject.GetComponent<Enemy>() == focus && focus != null){
				if(ranged){
					if(attackCooldown <= 0){
						if(strJob == "Wizard"){
							MagicMissile();
						}
						else{
							Attack();
						}
						attackCooldown = attackSpeed;
					}
				}
				else{
					if(Vector3.Distance(transform.position, focus.transform.position) > 70){
						transform.position = Vector3.MoveTowards(transform.position, focus.transform.position, Time.deltaTime * movementSpeed);
					}
				}
			}
		}
	}
	
	public void OnCollisionStay(Collision c){
		if(focus == c.gameObject.GetComponent<Enemy>()){
			if(!ranged && attackCooldown <= 0){
				if(strJob == "Warrior" && lv > 4){
					Cleave();
				} else if(strJob == "Cleric"){
					Stun();
				} else if(strJob == "Rogue" && lv > 4){
					Poison();
					Attack();
					canPoison = !canPoison;
				} else if(strJob == "Monk" && lv > 4){
					CriticalStrike();
				} else {
					Attack();
				}
				attackCooldown = attackSpeed;
			}
		}
	}
	
	public void OnTriggerExit(Collider c){
		if(c.tag == "Enemy"){
			Enemy leaving = c.transform.parent.gameObject.GetComponent<Enemy>();
			
			if(enemiesInRange.Contains(leaving)){
				enemiesInRange.Remove(leaving);
				enemiesInRange.TrimExcess();
				if(!enemiesInRange.Contains(focus)){
					focus = null;
				}
			}
		} else if(c.tag == "Hero"){
			Hero leaving = c.transform.parent.gameObject.GetComponent<Hero>();
			if(heroesInRange.Contains(leaving)){
				heroesInRange.Remove(leaving);
				heroesInRange.TrimExcess();
			}
		}
	}
	
	public void Update(){
	
		if(!activated){
			CheckSafety();
			HeroPlacement();
		} else {
			if(health <= 0){
				Death();
			}
		}
	
		index = gameplay.heroes.IndexOf(this);
		mousePosition = MousePosition.Instance().position;
		
		HealthRender();
		
		if(enemiesInRange.Count == 0){
			Detection(false);
			numberOfTargets = 0;
			focus = null;
		}
		
		if(xp >= toNextLevel){
			LevelUp();
		}
	}
	
	public void FixedUpdate(){
		if(status == "Stunned" || !activated)
			return;
		
		if(!focus)
			ReturnToPost();
		
		if(activated && detecting && !focus)
			Focus();
		
		Cooldown();
			
		
		switch(strJob){
			case "Warrior":
				AbilitiesWarrior();
				break;
			case "Wizard":
				AbilitiesWizard();
				break;
			case "Rogue":
				AbilitiesRogue();
				break;
			case "Monk":
				AbilitiesMonk();
				break;
			case "Druid":
				AbilitiesDruid();
				break;
			case "Ranger":
				AbilitiesRanger();
				break;
			case "Cleric":
				AbilitiesCleric();
				break;
			default:
				Debug.Log(strJob + " is INCORRECT!");
				break;
		}
		
		if(gameplay.enemiesLeft > 0){
			foreach(Enemy e in gameplay.enemies){
				if(e)
					e.GetComponent<Rigidbody>().AddForce(new Vector3(.000001f, 0f, 0f));
			}
		}
	}
	
	private void Attack(){
		if(focus){
			if(!focus.flying || (focus.flying && ranged)){
				if(strJob == "Ranger"){
					Projectile obj = Instantiate(Resources.Load("AttackAnimations/AttackRanger", typeof(Projectile)) as Projectile) as Projectile;
					obj.transform.position = transform.position;
					obj.GetComponent<Projectile>().target = focus;
				} else if(strJob != "Wizard"){
					MeleeAnimation();
				}
				DealDamage();
			}
		}
	}
	
	private void DealDamage(){
		if(focus.health - damage <= 0){
			xp += focus.xpValue;
			gameplay.playerGold += focus.goldValue;
			focus.health -= damage;
			foreach(Hero h in transform.parent.GetComponentsInChildren<Hero>()){
				if(h.focus == focus){
					h.focus = null;
				}
			}
					//focus = null;
			numberOfTargets--;
			if(strJob == "Monk")
				MonkHeal();
		} else {
			focus.health -= damage;
			Knockback();
		}
	}
	
	private void MeleeAnimation(){
		Melee obj = Instantiate(Resources.Load("AttackAnimations/Attack" + name, typeof(Melee)) as Melee) as Melee;
					
		Vector3 attackPosition;
		Vector3 attackRotation;
					
		float attackOffset = 45;
					
		if(transform.position.x > focus.transform.position.x){
			attackPosition = new Vector3(transform.position.x - attackOffset, transform.position.y, -20f);
			attackRotation = new Vector3(0f, 0f, 180f);
		} else {
			attackPosition = new Vector3(transform.position.x + attackOffset, transform.position.y, -20f);
			if(strJob != "Monk"){
				attackRotation = new Vector3(0f, 0f, 0f);
			} else {
				attackRotation = new Vector3(0f, 0f, 180f);
			}
		}
		if(transform.position.y > focus.transform.position.y){
			attackPosition = new Vector3(transform.position.x, transform.position.y - attackOffset, -20f);
						
		} else {
			attackPosition = new Vector3(transform.position.x, transform.position.y + attackOffset, -20f);
						
		}
		obj.transform.position = attackPosition;
		obj.transform.eulerAngles = attackRotation;
	}
	
	private void Detection(bool b){
		detecting = b;
	}
	
	private void ReturnToPost(){
		transform.position = Vector3.MoveTowards(transform.position, post, Time.deltaTime * movementSpeed);
	}
	
	private void Focus(){
		if(enemiesInRange.Count != 0 &&  numberOfTargets < maxNumberOfTargets){
			int numberOfVisuals = enemiesInRange.Count;
			focusIndex = 0;
			
			while(focusIndex < numberOfVisuals){
				if(enemiesInRange[focusIndex] != null && 
				//focus != enemiesInRange[focusIndex] && 
				enemiesInRange[focusIndex].status != "Stealth" ||
				(ranged && enemiesInRange[focusIndex].flying)){
						focus = enemiesInRange[focusIndex];
						numberOfTargets++;
						break;
				} else {
					focusIndex++;	
				}
			}
		}
	}
	
	public void FocusMe(int i){
		if(i < gameplay.enemies.Count){
			focus = null;
			focus = gameplay.enemies[i];
			numberOfTargets = 0;
			numberOfTargets++;
		}
	}
	
	private void CheckSafety(){
		int layerMask = 1 << 13;
		
		if(Physics.Raycast(transform.position, transform.forward, 50f, layerMask)){
			safe = true;
		} else {
			safe = false;
		}
	}
	
	public void Birth(string target){
		activated = false;
		canPoison = false;
				
		gameplay = Gameplay.Instance();
		
		tavern = Tavern.Instance();
		
		strJob = target;
		
		AssignClass();
		
		transform.Find("Collider").GetComponent<BoxCollider>().enabled  = false;
		
		XMLNodeList heroesXML = gameplay.xml.GetNodeList("doc>0>units>0>heroes>0>hero");
		heroXML = heroesXML[intJob] as XMLNode;
		
		levelsXML = heroXML.GetNodeList("levels>0>level");
		
		transform.parent = GameObject.Find("Heroes").transform;
		
		safe = false;
		
		status = "Fine";
		
		maxNumberOfTargets = 1;
		focusIndex = 0;
		
		clericHealCooldown = 90;
		battlecryCooldown = 360;
		stealthCooldown = 360;
		
		transform.position = new Vector3(mousePosition.x, mousePosition.y + 60f, -20f);
		
		lv = Tavern.Instance().level - 1;
		LevelUp();
		
		firstName = firstNames[intJob, Random.Range(0, firstNames.GetLength(1))];
		lastName = lastNames[intJob, Random.Range(0, lastNames.GetLength(1))];
		
		GameObject obj; 
		obj = Instantiate(Resources.Load("CI", typeof(GameObject)) as GameObject) as GameObject;
		obj.transform.parent = transform;
		obj.transform.localPosition = Vector3.zero;
		
		TextMesh textMesh;
		textMesh = obj.transform.Find("Name").GetComponent<TextMesh>();
		textMesh.text = firstName + " " + lastName;
		
		healthBar = obj.transform.Find("Health/Bar").gameObject;
		healthBarWidth = healthBar.transform.localScale.x;
		
		gameplay.heroes.Add(this);
		index = gameplay.heroes.IndexOf(this);
		
		name = name.Split("("[0])[0];
	}
	
	private void AssignClass(){
		switch(strJob){
			case "Cleric":
				intJob = 2;
				ranged = false;
				break;
			case "Druid":
				intJob = 3;
				ranged = false;
				break;
			case "Monk":
				intJob = 4;
				ranged = false;
				break;
			case "Ranger":
				intJob = 5;
				ranged = true;
				break;
			case "Rogue":
				intJob = 0;
				ranged = false;
				break;
			case "Warrior":
				intJob = 1;
				ranged = false;
				break;
			case "Wizard":
				intJob = 6;
				ranged = true;
				break;
			default:
				Debug.Log("No proper target found");
				break;
		}
	}
	
	private void Death(){
		gameplay.heroes.Remove(gameObject.GetComponent<Hero>());
		gameplay.heroes.TrimExcess();
		Destroy(gameObject);
	}
	
	private void HealthRender(){
		float healthPercent = (float)health / (float)maxHealth;
		healthBar.transform.localScale = new Vector3(healthBarWidth * healthPercent, healthBar.transform.localScale.y, healthBar.transform.localScale.z );
	}
	
	private void HeroPlacement(){
		if(Input.GetMouseButtonUp(0)){
			if(safe){
				activated = true;
				tavern.heroSelected = false;
				post =	new Vector3(transform.position.x, transform.position.y, -20f);
				transform.Find("Collider").GetComponent<BoxCollider>().enabled = true;
			} 
		}else if(Input.GetMouseButtonUp(1)){
			gameplay.playerGold += tavern.heroCost;
			Death();
			tavern.heroSelected = false;
		} else{
			transform.position = new Vector3(mousePosition.x, mousePosition.y + 60f, -20f);
		}
	}
	
	private void Cooldown(){
		invulnerableCooldown--;
		if(invulnerableCooldown < 0)
			invulnerableCooldown = 0;
			
		attackCooldown--;
		if(attackCooldown < 0)
			attackCooldown = 0;
	}
	
	private void Knockback(){
		if(focus){
			Vector3 difference;

			difference = focus.transform.position - transform.position;
			difference = difference.normalized;
			focus.GetComponent<Rigidbody>().velocity = knockbackForce * difference;
			
		}
	}
	
	private void StatusEffect(){
		switch(status){
			case "Fine":
				break;
			case "Poisoned":
				break;
			case "Burned":
				break;
			case "Frozen":
				break;
			case "Stunned":
				break;
			case "Stealth":
				break;
			case "Fear":
				break;
			case "Invulnerable":
				invulnerableTime--;
				
				if(invulnerableTime <= 0){
					status = "Fine";
				}
				break;
			default :
				break;
		}
	}
	
	private void LevelUp(){
		if(lv < 20){
			
			levelXML = levelsXML[lv] as XMLNode;
			
			lv++;
			
			damage = int.Parse(levelXML.GetValue("@damage"));
			attackSpeed = int.Parse(levelXML.GetValue("@speed"));
			range =  float.Parse(levelXML.GetValue("@range"));
			maxHealth = int.Parse(levelXML.GetValue("@health"));
			health = maxHealth;
			toNextLevel += int.Parse(levelXML.GetValue("@next"));
			
			SphereCollider detection = transform.Find("Detection").GetComponent<SphereCollider>();
			detection.radius = range;
		}
	}
	
	private void AbilitiesWarrior(){
		Battlecry();
		
		if(lv == 20){
			if(health < Mathf.Floor(maxHealth / 2) && invulnerableCooldown <= 0){
				Invulnerability();
			}
		}
	}
	private void AbilitiesWizard(){
		if(lv == 20){
			//Whatever his final skill will be
			
		} else if(lv >= 15){
			
		} else if(lv >= 10){
			
		} else if(lv >= 5){
			
		} else {
			//Debug.Log("Someone has broken the leveling rules...he's level " + lv);
		}
	}
	private void AbilitiesMonk(){
		if(lv == 20){
		}
	}
	private void AbilitiesRogue(){
		Stealth();
		
		if(lv == 20){
			//Whatever his final skill will be
		}
	}
	private void AbilitiesDruid(){
		SummonCompanion();
	
		if(lv == 20){
			//Whatever his final skill will be
		
		} else if(lv >= 15){
			
		} else if(lv >= 10){
		
		} else if(lv >= 5){
			
		} else {
			//Debug.Log("Someone has broken the leveling rules...he's level " + lv);
		}
	}
	private void AbilitiesCleric(){
			
		if(lv == 20){
			//Whatever his final skill will be
			ClericHeal(6);
		} else if(lv >= 15){
			ClericHeal(4);
		} else if(lv >= 10){
			ClericHeal(2);
		} else if(lv >= 5){
			ClericHeal(1);
		} else {
			//Debug.Log("Someone has broken the leveling rules...he's level " + lv);
		}
	}
	private void AbilitiesRanger(){
		if(lv == 20){
			//Whatever his final skill will be
			
		} else if(lv >= 15){
			
		} else if(lv >= 10){
			
		} else if(lv >= 5){
			
		} else {
			//Debug.Log("Someone has broken the leveling rules...he's level " + lv);
		}
	}
	
	private void Battlecry(){
		battlecryCooldown--;
		
		if(battlecryCooldown <= 0){
			foreach(Enemy e in enemiesInRange){
				if(e){
					int fearTime = 120;
					e.fearTime = fearTime;
					e.status = "Fear";
				}
			}
			battlecryCooldown = 360;
		}
	}
	
	private void Cleave(){
			List<Enemy> enemiesToCleave = new List<Enemy>();
			
			int targets;
			
			if(lv == 20){
				targets = 4;
			} else if(lv >= 15){
				targets = 4;
			} else if(lv >= 10){
				targets = 3;
			} else if(lv >= 5){
				targets = 2;
			} else {
				targets = 0;
			}
			
			Debug.Log("Cleave");
			
			for(int i = 0; i < targets; i++){
				if(i < enemiesInRange.Count)
					enemiesToCleave.Add(enemiesInRange[i]);
			}
			foreach(Enemy e in enemiesToCleave){
				focus = e;
				Attack();
			}
			enemiesToCleave.Clear();
				
			attackCooldown = attackSpeed;
	}
	
	private void Invulnerability(){
		invulnerableTime = 40;
		status = "Invulnerable";
		invulnerableCooldown = 240;
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
	
	private void ClericHeal(int healthRestored){
		clericHealCooldown--;
		
		if(clericHealCooldown <= 0){
			Debug.Log("Heal");
			foreach(Hero h in heroesInRange){
				if(h)
					if(h.health + healthRestored >= h.maxHealth)
						h.health = h.maxHealth;
					else
						h.health += healthRestored;
			}
			if(health + healthRestored >= maxHealth){
				health = maxHealth;
			}else {
				health += healthRestored;
			}
			clericHealCooldown = 90;
		}
	}
	
	private void Stealth(){
		if(status == "Fine"){
			stealthCooldown--;
			
			if(stealthCooldown <= 0){
				status = "Stealth";
				
				foreach(Enemy e in GameObject.Find("Enemies").GetComponentsInChildren<Enemy>()){
					if(e.focus == gameplay.heroes[index]){
						e.focus = null;
					}
				}
				
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
	
	private void Poison(){
		if(focus && canPoison){
			
			int poisonDamage;
		
			if(lv == 20){
				poisonDamage = 6;
			} else if(lv >= 15){
				poisonDamage = 4;
			} else if(lv >= 10){
				poisonDamage = 2;
			} else if(lv >= 5){
				poisonDamage = 1;
			} else {
				poisonDamage = 0;
			}
			
			focus.poisonTime = 180;
			focus.untilPoisonDamage = 60;
			focus.poisonDamage = poisonDamage;
		}
	}
	
	private void MonkHeal(){
		int toHeal;
		
		if(lv == 20){
			toHeal = 15;
		} else if(lv >= 15){
			toHeal = 12;
		} else if(lv >= 10){
			toHeal = 6;
		} else if(lv >= 5){
			toHeal = 3;
		} else {
			toHeal = 1;
		}
		
		if(health + toHeal >= maxHealth){
			health = maxHealth;
		}else {
			health += toHeal;
		}
	}
	
	private void CriticalStrike(){
		if(focus){
		
			int version;
		
			if(lv == 20){
				version = 4;
			} else if(lv >= 15){
				version = 3;
			} else if(lv >= 10){
				version = 2;
			} else if(lv >= 5){
				version = 1;
			} else {
				version = 0;
			}
			
			// Attack();
			
			if(Random.Range(0 , 100) <= (version * 5)){
				Debug.Log("Critical Hit!");
				xp += focus.xpValue;
				gameplay.playerGold += focus.goldValue;
				focus.health = 0;
				focus = null;
				numberOfTargets--;
				if(strJob == "Monk")
					MonkHeal();
			} else{
				Attack();
			}
			
			
		}
	}
	
	private void MagicMissile(){
			int targets;
			
			if(lv == 20){
				targets = 6;
			} else if(lv >= 15){
				targets = 5;
			} else if(lv >= 10){
				targets = 4;
			} else if(lv >= 5){
				targets = 3;
			} else {
				targets = 2;
			}
		
			List<Enemy> enemiesToShoot = new List<Enemy>();
				
			for(int i = 0; i < targets; i++){
				if(i < enemiesInRange.Count)
					enemiesToShoot.Add(enemiesInRange[i]);
			}
			foreach(Enemy e in enemiesToShoot){
				focus = e;
				GameObject obj = Instantiate(Resources.Load("AttackAnimations/AttackWizard" , typeof(GameObject)) as GameObject) as GameObject;
				obj.transform.position = transform.position;
				obj.GetComponent<Projectile>().target = focus;
				Attack();
			}
			enemiesToShoot.Clear();
	}
	
	private void SummonCompanion(){
		
	}
}
