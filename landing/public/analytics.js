// PostHog product analytics.
// POSTHOG_KEY/POSTHOG_HOST are substituted at container start (see landing/entrypoint.sh)
// from the POSTHOG_KEY/POSTHOG_HOST env vars — left blank, analytics stay disabled.
;(function () {
  var POSTHOG_KEY = '${POSTHOG_KEY}'
  var POSTHOG_HOST = '${POSTHOG_HOST}'
  if (!POSTHOG_KEY || POSTHOG_KEY.indexOf('POSTHOG_KEY') !== -1) return

  function init() {
    !(function (t, e) {
      var o, n, p, r
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split('.')
            2 == o.length && ((t = t[o[0]]), (e = o[1]))
            t[e] = function () {
              t.uploadQueue.push([e].concat(Array.prototype.slice.call(arguments, 0)))
            }
          }
          ;(p = t.createElement('script')).type = 'text/javascript'
          p.crossOrigin = 'anonymous'
          p.async = !0
          p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js'
          ;(r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r)
          var u = e
          for (
            void 0 !== a ? (u = e[a] = []) : (a = 'posthog'),
              u.people = u.people || [],
              u.toString = function (t) {
                var e = 'posthog'
                return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e
              },
              u.people.toString = function () {
                return u.toString(1) + '.people (stub)'
              },
              o =
                'init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property'.split(
                  ' ',
                ),
              n = 0;
            n < o.length;
            n++
          )
            g(u, o[n])
          e._i.push([i, s, a])
        }),
        (e.__SV = 1))
    })(document, window.posthog || [])

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'always',
      loaded: function (ph) {
        // Carry the anonymous distinct_id into the Telegram deep link so the bot
        // can merge this session with the resulting Telegram-user profile via alias().
        var distinctId = ph.get_distinct_id()
        if (!distinctId) return
        document.querySelectorAll('a[href^="https://t.me/to_notion_robot"]').forEach(function (a) {
          var url = new URL(a.href)
          url.searchParams.set('start', distinctId)
          a.href = url.toString()
        })
      },
    })
  }

  // Keep PostHog off the critical rendering path: start it once the browser is idle,
  // falling back to the load event on browsers without requestIdleCallback (e.g. Safari).
  if ('requestIdleCallback' in window) {
    requestIdleCallback(init, {timeout: 4000})
  } else {
    window.addEventListener('load', init)
  }
})()
