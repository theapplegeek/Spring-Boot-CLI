export interface Pom {
    project: {
        groupId: string[];
        artifactId: string[];
        name: string[];
        description: string[];
        licenses: { license: any[] }[];
        developers: { developer: any[] }[];
    };
}