# Remplacement temporaire d'une méthode de classe pour tester une API externe
# sans dépendance de mock supplémentaire et sans trafic réseau.
module ScopedClassMethodStub
  def with_stubbed_class_method(klass, method_name, replacement)
    singleton = klass.singleton_class
    original = klass.method(method_name)

    singleton.send(:define_method, method_name) do |*args, **kwargs, &block|
      replacement.call(*args, **kwargs, &block)
    end
    yield
  ensure
    singleton.send(:define_method, method_name, original) if original
  end
end
