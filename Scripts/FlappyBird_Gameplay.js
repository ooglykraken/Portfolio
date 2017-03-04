#pragma strict

import System.Collections.Generic;

public class FlappyBird_Gameplay extends MonoBehaviour{

	private var character: GameObject = null;
	private var lastObstacle: GameObject = null;
	private var newGamePopup: GameObject = null;
	
	private var obstacles:List.<FlappyBird_Obstacle> = new List.<FlappyBird_Obstacle>();
	
	private var backgroundImages:List.<Transform> = new List.<Transform>();
	
	private var scroller:Transform;
	
	public var distance:float;
	private var pipeOffset:float = 12;
	
	private var resets:int = 0;
	public var passes:int;
	
	public var started: boolean;
	
	public function Awake(): void{
		// character = Instantiate(Resources.Load("Character", typeof(GameObject)) as GameObject) as GameObject;
		// character.AddComponent.<Character>();
		Application.targetFrameRate = 60;
		
		ObjectPools.Instance().InstantiatePool("FlappyBird/Obstacle", Resources.Load("FlappyBird/Obstacle", typeof(GameObject)) as GameObject, FlappyBird_Obstacle, 6);
		
		var obj:GameObject;
		
		obj = GameObject.Find("BackgroundMusic");
		if(!obj){
			obj = Instantiate(Resources.Load("FlappyBird/BackgroundMusic", typeof(GameObject)) as GameObject) as GameObject;
			obj.name = obj.name.Split("("[0])[0];
			DontDestroyOnLoad(obj);
		}
		character = transform.Find("Scroller/Character").gameObject;
		scroller = transform.Find("Scroller");
		
		passes = 0;
		distance = 0;
		
		AddObstacle();
		AddObstacle();
		AddObstacle();
		
		AddBackground();
		AddBackground();
		AddBackground();
		
		var popup: GameObject = Instantiate(Resources.Load("FlappyBird/NewGame_Popup", typeof(GameObject)) as GameObject) as GameObject;
		popup.transform.parent = transform;
		
		newGamePopup = popup;
		
		started = false;
	}
	
	public function Update(): void{
	
		if(!started && Input.GetMouseButtonUp(0)){
			Destroy(newGamePopup);
			newGamePopup = null;
			started = true;
			//character.GetComponent.<FlappyBird_Character>().PlayMusic();
		}
		
		if(!started || !character)
			return;
			
		var max: float = 10000;
			
		distance = character.transform.position.x - (parseFloat(resets) * max);
		
		passes = Math.Floor(distance / pipeOffset);
		
		if(character.transform.position.x > max){
			resets++;
		
			for (var i:int = 0; i < scroller.childCount; i++) {
				var t:Transform = scroller.GetChild(i);
				t.position += new Vector3(
					-max,
					0,
					0
				);
			}
		}
		
		if (character.transform.position.x > obstacles[2].transform.position.x)
			AddObstacle();
			
		if (character.transform.position.x > backgroundImages[1].position.x)
			AddBackground();
	}
	
	private function AddObstacle(): void {
		//var obstacle:Transform = (Instantiate(Resources.Load("FlappyBird/Obstacle", typeof(GameObject)) as GameObject) as GameObject).transform;
		
		var obstacle:Behaviour = ObjectPools.Instance().GetGameObjectByPath("FlappyBird/Obstacle");
		//obstacle.transform.parent = transform.parent;
		//obstacle.transform.position = new Vector3(powerup.position.x * gameplay.GetLaneSpacing() + chunkIn.transform.position.x, 0, -10);
		obstacle.enabled = true;
				
		var x:float;
		if (obstacles.Count == 0)
			x = character.transform.position.x + pipeOffset;
		else
			x = obstacles[obstacles.Count - 1].transform.position.x + pipeOffset - (Random.Range(1f, 2f) * (distance / 1000f)); //Difficulty modified according to distance
			
		obstacle.transform.position = new Vector3(
			x,
			Random.Range(0f,8f) - 4f,
			0
		);
		
		obstacle.transform.parent = scroller;
		
		obstacles.Add(obstacle);
		if (obstacles.Count > 5) {
			obstacles[0].enabled = false;
			obstacles.RemoveAt(0);
		}
		
		obstacle.enabled = true;
		
		lastObstacle = obstacle.gameObject;
	}
	
	private function AddBackground(): void{
		var bg:Transform = (Instantiate(Resources.Load("FlappyBird/Background", typeof(GameObject)) as GameObject) as GameObject).transform;
		
		var offset: float = 35f;
		
		var x:float;
		if(backgroundImages.Count == 0)
			x = 0f;
		else
			x = backgroundImages[backgroundImages.Count - 1].position.x + offset;
			
		bg.position = new Vector3(x, 0f, 10f);
		
		bg.parent = scroller;
		
		backgroundImages.Add(bg);
		if (backgroundImages.Count > 3) {
			Destroy(backgroundImages[0].gameObject);
			backgroundImages.RemoveAt(0);
		}
	}
	
	// public function Death(): void{
		// var popup: GameObject = Instantiate(Resources.Load("Popup", typeof(GameObject)) as GameObject) as GameObject;
		// popup.transform.parent = gameObject.transform;
		// var newPosition: Vector3 = new Vector3(Camera.main.transform.position.x, 0f, 0f);
		
		// popup.transform.position = newPosition;
	// }
	
	private static var instance:FlappyBird_Gameplay;
	
	public static function Instance():FlappyBird_Gameplay {
		if (instance == null) {
			instance = new GameObject("FlappyBird_Gameplay").AddComponent(FlappyBird_Gameplay);
			DontDestroyOnLoad(instance);
		}

		return instance;
	}
}