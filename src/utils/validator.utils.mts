const isValidMavenGroupId = (groupId: string): boolean => {
    const regex: RegExp = /^(?![.-])(?!.*[.-]{2})([a-zA-Z][a-zA-Z0-9-]*)(\.[a-zA-Z][a-zA-Z0-9-]*)*$/;
    return regex.test(groupId);
}
const isValidMavenArtifactId = (artifactId: string): boolean => {
    const regex: RegExp = /^(?![.-])[a-zA-Z0-9.-]+(?<![.-])$/;
    return regex.test(artifactId);
}

const isValidProjectName = (projectName: string): boolean => {
    const regex: RegExp = /^(?![.-])[a-zA-Z0-9._-]+(?<![.-])$/;
    return regex.test(projectName);
}

export {
    isValidProjectName,
    isValidMavenGroupId,
    isValidMavenArtifactId
}