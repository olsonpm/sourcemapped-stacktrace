#! /usr/bin/env sh

#
# can't use `npx` because it wants to swallow error output for some reason.  I
#   didn't look too much into it though, meaning it could have something to do
#   with webpack and esm \_O_/
#

command="${1}"
shift

build() {
  rm -rf dist && mkdir dist
  node_modules/.bin/webpack --config-register esm
}

warnAndExit() {
  printf "%s\\n%s\\n\\nexiting" "${1}" "${2}" >&2
  exit
}

changeDirectory() {
  cd "${1}" || warnAndExit \
    'Failed to change directory' \
    "Directory: ${1}"
}

case "${command}" in
  build)
    build "$@" ;;

  lint)
    node node_modules/.bin/eslint --ext .js -- lib webpack.config.js ;;

  release)
    shouldAbortRelease='false'
    if [ ! -d /tmp ]; then
      echo "/tmp directory does not exist" >&2
      shouldAbortRelease='true'
    fi
    if ! [ -x "$(command -v jq)" ]; then
      echo "'jq' is not installed." >&2
      shouldAbortRelease='true'
    fi
    if [ "${shouldAbortRelease}" = 'true' ]; then
      echo 'aborting release' >&2
      exit 1
    fi

    repoName='sourcemapped-stacktrace'
    tmpReleaseDir="/tmp/${repoName}_release"
    tmpReleaseGit="/tmp/${repoName}_git"
    projectDir="${PWD}"

    rm -rf "${tmpReleaseDir}" "${tmpReleaseGit}"
    mkdir "${tmpReleaseGit}"
    cp -R "${projectDir}" "${tmpReleaseDir}"

    changeDirectory "${tmpReleaseDir}"
    git checkout release
    git pull

    changeDirectory "${projectDir}"
    mv "${tmpReleaseDir}/.git" "${tmpReleaseGit}"
    rm -rf "${tmpReleaseDir}"
    mkdir "${tmpReleaseDir}"
    mv "${tmpReleaseGit}/.git" "${tmpReleaseDir}"
    rm -rf "${tmpReleaseGit}"

    build "$@"

    cp dist/index* readme.md license package.json "${tmpReleaseDir}"

    changeDirectory "${tmpReleaseDir}"
    releaseVersion="$(jq -r .version ./package.json)"
    git add . && git commit -m "release ${releaseVersion}" && git tag "${releaseVersion}" && git push && git push origin "${releaseVersion}"

    changeDirectory "${projectDir}"
    rm -rf "${tmpReleaseDir}"
    echo "successfully released version ${releaseVersion}"

    ;;

  '')
    echo 'no command given' >&2 ;;

  *)
    echo "command not found: ${command}" >&2 ;;
esac
