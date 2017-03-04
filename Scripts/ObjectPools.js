#pragma strict

public class ObjectPools extends MonoBehaviour {
	private var objectPools:ObjectPool[] = [];
	
	private var singleObjects:GameObject[] = [];
	
	private var obstacles:FlappyBird_Obstacle[] = [];
	//private var holes:Hole[] = [];
	
	public function ObjectPools() {}
	
	public function InstantiatePool(path:String, prefab:GameObject, type:System.Type, count:int):void {
		var array:Array = objectPools;
		//Debug.Log(path);
		var pool:ObjectPool = new ObjectPool(prefab, type, count);
		pool.path = path;
		array.Push(pool);
		objectPools = array;
		
		if (type == FlappyBird_Obstacle) {
			array = obstacles;
			array = array.Concat(pool.behaviours);
			obstacles = array;
		}
		// if (type == Hole) {
			// array = holes;
			// array = array.Concat(pool.behaviours);
			// holes = array;
		// }
	}
	
	public function GetGameObjectByPath(path:String):Behaviour {
		for (var i:int = 0; i < objectPools.length; i++) {
			var pool:ObjectPool = objectPools[i];
			if (pool.path != path)
				continue;
			for (var j:int = 0; j < pool.behaviours.length; j++) {
				var obj:Behaviour = pool.behaviours[j];
				if (!obj.enabled) {
					return obj;
				}
			}
			return pool.InstantiateObj();
		}
		
		return null;
	}
	
	public function GetGameObjectByPathNoInstantiate(path:String):Behaviour {
		for (var i:int = 0; i < objectPools.length; i++) {
			var pool:ObjectPool = objectPools[i];
			if (pool.path != path)
				continue;
			for (var j:int = 0; j < pool.behaviours.length; j++) {
				var obj:Behaviour = pool.behaviours[j];
				if (!obj.enabled) {
					return obj;
				}
			}
			//return pool.InstantiateObj();
		}
		
		return null;
	}
	
	public function GetSingleObject(obj:GameObject):GameObject {
		for (var i:int = 0; i < singleObjects.length; i++) {
			var singleObject:GameObject = singleObjects[i];
			if (singleObject.name == obj.name) {
				Destroy(obj);
				return singleObject;
			}
		}
		
		obj.transform.parent = transform;
		var array:Array = singleObjects;
		array.Push(obj);
		singleObjects = array;
		
		return obj;
	}
	
	public function GetObstacles():FlappyBird_Obstacle[] {
		return obstacles;
	}
	// public function GetHoles():Hole[] {
		// return holes;
	// }
	
	private static var instance:ObjectPools;
	public static function Instance():ObjectPools {
		if (instance == null) {
			instance = new GameObject("ObjectPools").AddComponent(ObjectPools);
			//DontDestroyOnLoad(instance);
		}

		return instance;
	}
}

public class ObjectPool {
	public var path:String = "";
	public var behaviours:Behaviour[] = [];
	public var type:System.Type;
	public var prefab:GameObject;
	
	public function ObjectPool(p:GameObject, t:System.Type, count:int) {
		prefab = p;
		type = t;
		
		for (var i:int = 0; i < count; i++) {
			InstantiateObj();
		}
	}
		
	public function InstantiateObj():Behaviour {
		var obj:GameObject = GameObject.Instantiate(prefab);
		obj.transform.parent = ObjectPools.Instance().transform;
		
		var behaviour:Behaviour = obj.GetComponent(type) as Behaviour;
		var array:Array = behaviours;
		array.Push(behaviour);
		behaviours = array;
		
		behaviour.enabled = false;
		
		return behaviour;
	}
}