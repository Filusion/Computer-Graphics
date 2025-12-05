export class Light {

    constructor({
        color = [255, 255, 255],
        intensity = 1,
        attenuation = [1, 0.1, 0.01],
        directivity = 50,   
        beamWidth = Math.PI / 4,  
    } = {}) {
        this.color = color;
        this.intensity = intensity;
        this.attenuation = attenuation;
        this.directivity = directivity;
        this.beamWidth = beamWidth;
    }

}