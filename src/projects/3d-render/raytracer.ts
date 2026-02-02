import { Color } from './color'
import { Ray, V3 } from './vec3'
import { Sphere } from './shape'

const MAX_BOUNCES = 3
const SAMPLES_PER_DIRECTION = 2
const SAMPLES_PER_PIXEL = SAMPLES_PER_DIRECTION ** 2

export class Raytracer {
    constructor(
        public scene: any,
        public w: number,
        public h: number,
    ) {}

    tracedValueAtPixel(x: number, y: number) {
        let color = new Color(0, 0, 0)
        for (let dx = 0; dx < SAMPLES_PER_DIRECTION; dx++) {
            for (let dy = 0; dy < SAMPLES_PER_DIRECTION; dy++) {
                let ray = this.rayForPixel(
                    x + dx / SAMPLES_PER_DIRECTION,
                    y + dy / SAMPLES_PER_DIRECTION,
                )
                let sample = this.tracedValueForRay(ray, MAX_BOUNCES)
                color.addInPlace(sample.scale(1 / SAMPLES_PER_PIXEL))
            }
        }
        return color
    }

    private tracedValueForRay(ray: Ray, depth: number) {
        function min(xs: Array<number>, f: Function) {
            if (xs.length === 0) {
                return null
            }
            let minValue = Infinity
            let minElement = null
            for (let x of xs) {
                let value = f(x)
                if (value < minValue) {
                    minValue = value
                    minElement = x
                }
            }
            return minElement
        }

        let intersection = min(
            this.scene.objects
                .map((o: Sphere) => {
                    let t = o.intersection(ray)
                    if (!t) {
                        return null
                    }
                    let point = ray.at(t)
                    return {
                        object: o,
                        t,
                        point,
                        normal: o.normalAt(point),
                    }
                })
                .filter(Boolean),
            (i) => i.t,
        )

        if (!intersection) {
            return new Color(0, 0, 0)
        }
        let color = this.colorAtIntersection(intersection)
        if (depth > 0) {
            let v = ray.direction.scale(-1).normalized()
            let r = intersection.normal
                .scale(2)
                .scale(intersection.normal.dot(v))
                .minus(v)
            let reflectionRay = new Ray(
                intersection.point.plus(intersection.normal.scale(0.01)),
                r,
            )
            let reflected = this.tracedValueForRay(reflectionRay, depth - 1)
            color.addInPlace(reflected.times(intersection.object.material.kr))
        }
        return color
    }

    private colorAtIntersection(intersection) {
        let color = new Color(0, 0, 0)
        let { material } = intersection.object
        let v = this.scene.camera.minus(intersection.point).normalized()
        this.scene.lights.forEach((light) => {
            let l = light.position.minus(intersection.point).normalized()
            let lightInNormalizedDirection = intersection.normal.dot(l)
            if (lightInNormalizedDirection < 0) {
                return
            }
            let isShadowed = this.isPointInShadowFromLight(
                intersection.point,
                intersection.object,
                light,
            )
            if (isShadowed) {
                return
            }
            let diffuse = material.kd
                .times(light.id)
                .scale(lightInNormalizedDirection)
            color.addInPlace(diffuse)
            let r = intersection.normal
                .scale(2)
                .scale(lightInNormalizedDirection)
                .minus(l)
            let amountReflectedAtViewer = v.dot(r)
            let specular = material.ks
                .times(light.is)
                .scale(Math.pow(amountReflectedAtViewer, material.alpha))
            color.addInPlace(specular)
        })
        let ambient = material.ka.times(this.scene.ia)
        color.addInPlace(ambient)
        color.clampInPlace()
        return color
    }

    private isPointInShadowFromLight(point, objectToExclude, light) {
        let shadowRay = new Ray(point, light.position.minus(point))
        for (let i in this.scene.objects) {
            let obj = this.scene.objects[i]
            if (obj == objectToExclude) {
                continue
            }
            let t = obj.intersection(shadowRay)
            if (t && t <= 1) {
                return true
            }
        }
        return false
    }

    private rayForPixel(x: number, y: number) {
        let xt = x / this.w
        let yt = (this.h - y - 1) / this.h
        let top = V3.lerp(
            this.scene.imagePlane.topLeft,
            this.scene.imagePlane.topRight,
            xt,
        )
        let bottom = V3.lerp(
            this.scene.imagePlane.bottomLeft,
            this.scene.imagePlane.bottomRight,
            xt,
        )
        let point = V3.lerp(bottom, top, yt)
        return new Ray(point, point.minus(this.scene.camera))
    }
}

const WIDTH = 256
const HEIGHT = 192
const SCENE = {
    camera: new V3(0, 0, 2),
    imagePlane: {
        topLeft: new V3(-1.28, 0.86, -0.5),
        topRight: new V3(1.28, 0.86, -0.5),
        bottomLeft: new V3(-1.28, -0.86, -0.5),
        bottomRight: new V3(1.28, -0.86, -0.5),
    },
    ia: new Color(0.5, 0.5, 0.5),
    lights: [
        {
            position: new V3(-3, -0.5, 1),
            id: new Color(0.8, 0.3, 0.3),
            is: new Color(0.8, 0.8, 0.8),
        },
        {
            position: new V3(3, 2, 1),
            id: new Color(0.4, 0.4, 0.9),
            is: new Color(0.8, 0.8, 0.8),
        },
    ],
    objects: [
        new Sphere(new V3(-1.1, 0.6, -1), 0.2, {
            ka: new Color(0.1, 0.1, 0.1),
            kd: new Color(0.5, 0.5, 0.9),
            ks: new Color(0.7, 0.7, 0.7),
            alpha: 20,
            kr: new Color(0.1, 0.1, 0.2),
        }),
        new Sphere(new V3(0.2, -0.1, -1), 0.5, {
            ka: new Color(0.1, 0.1, 0.1),
            kd: new Color(0.9, 0.5, 0.5),
            ks: new Color(0.7, 0.7, 0.7),
            alpha: 20,
            kr: new Color(0.2, 0.1, 0.1),
        }),
        new Sphere(new V3(1.2, -0.5, -1.75), 0.4, {
            ka: new Color(0.1, 0.1, 0.1),
            kd: new Color(0.1, 0.5, 0.1),
            ks: new Color(0.7, 0.7, 0.7),
            alpha: 20,
            kr: new Color(0.8, 0.9, 0.8),
        }),
    ],
}
let image = new Image(WIDTH, HEIGHT)
const imageColorFromColor = (color) => ({
    r: Math.floor(color.r * 255),
    g: Math.floor(color.g * 255),
    b: Math.floor(color.b * 255),
})
const tracer = new Raytracer(SCENE, WIDTH, HEIGHT)
